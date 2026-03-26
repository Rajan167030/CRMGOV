// ═══════════════════════════════════════════════════════════════
//  CHAT SERVICE — Orchestrates the full chat pipeline
//
//  Flow per message:
//   1. Validate sessionId + message
//   2. Load session from MongoDB
//   3. Append user message to session.messages
//   4. Call AI service (FastAPI, via ai.service.js)
//   5. Merge state_update into session.state
//   6. Append AI reply to session.messages
//   7. If AI says done → validate fields → create complaint
//   8. Save session and return response
//
//  Edge cases handled:
//   - AI timeout / failure → rollback user message, return error
//   - AI says done but missing fields → keep session alive, ask again
//   - Completed sessions reject new messages
// ═══════════════════════════════════════════════════════════════

import mongoose from "mongoose";
import { Session } from "../models/session.model.js";
import { sendChatToAI } from "./ai.service.js";
import { createComplaint, getComplaintByMongoId } from "./complaint.service.js";
import {
  sanitizeStateUpdate,
  validateComplaintFields,
} from "../utils/validator.js";

const buildClarificationReply = (missingFields) => {
  if (!Array.isArray(missingFields) || missingFields.length === 0) {
    return "I still need a few more details before I can register the complaint.";
  }

  if (missingFields.includes("complaint") && missingFields.includes("location")) {
    return "I need both the complaint details and the exact location before I can register this. Please describe what happened and share the area, landmark, or street.";
  }

  if (missingFields.includes("complaint")) {
    return "Please describe the issue in a little more detail so I can register the complaint.";
  }

  if (missingFields.includes("location")) {
    return "Please share the exact location or a nearby landmark before I register the complaint.";
  }

  if (missingFields.includes("department")) {
    return "I still need the correct department for this complaint. Please specify it if you know it.";
  }

  return `I still need a few details before I can register: ${missingFields.join(", ")}. Could you please provide them?`;
};

const toTicketPayload = (complaint) => {
  if (!complaint) {
    return undefined;
  }

  return {
    _id: complaint._id.toString(),
    ticketId: complaint.ticketId,
    complaint: complaint.complaint,
    department: complaint.department,
    location: complaint.location,
    priority: complaint.priority,
    status: complaint.status,
    createdAt: complaint.createdAt,
  };
};

// ── Helpers ─────────────────────────────────────────────────────

const loadSession = async (sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    throw error;
  }

  return session;
};

// ── Create a new empty chat session ─────────────────────────────

export const createSession = async (userId) => {
  return Session.create({
    userId,
    state: {},
    messages: [],
  });
};

// ═══════════════════════════════════════════════════════════════
//  PROCESS MESSAGE — The main pipeline entry point
// ═══════════════════════════════════════════════════════════════

export const processMessage = async (sessionId, message) => {
  // ── Step 1: Validate inputs ───────────────────────────────────
  if (!mongoose.isValidObjectId(sessionId)) {
    const error = new Error("Invalid sessionId");
    error.statusCode = 400;
    throw error;
  }

  if (typeof message !== "string" || !message.trim()) {
    const error = new Error("Message is required");
    error.statusCode = 400;
    throw error;
  }

  // ── Step 2: Load session from MongoDB ─────────────────────────
  const session = await loadSession(sessionId);

  // Reject messages on completed sessions
  if (session.state?.completed) {
    const error = new Error("This session is already completed");
    error.statusCode = 409;
    throw error;
  }

  // ── Step 3: Append user message BEFORE calling AI ─────────────
  //    (so the AI sees the full conversation history)
  session.messages.push({
    role: "user",
    content: message.trim(),
  });

  // ── Step 4: Call AI service (FastAPI black-box) ────────────────
  let aiResponse;
  try {
    aiResponse = await sendChatToAI({
      message: message.trim(),
      messages: session.messages,
      state: session.state || {},
    });
  } catch (aiError) {
    // AI failed → rollback the user message so the session stays clean
    session.messages.pop();
    await session.save();

    // Re-throw with a user-friendly message
    const error = new Error(
      aiError.message || "AI service is temporarily unavailable. Please try again."
    );
    error.statusCode = aiError.statusCode || 502;
    throw error;
  }

  // ── Step 5: Merge state_update into session.state ─────────────
  const stateUpdate = sanitizeStateUpdate(aiResponse.state_update);

  session.state = {
    ...(session.state || {}),
    ...stateUpdate,
  };

  // Persist the remote AI session ID if the grievance service returns one
  if (typeof aiResponse.aiSessionId === "string" && aiResponse.aiSessionId.trim()) {
    session.state.aiSessionId = aiResponse.aiSessionId.trim();
  }

  // ── Step 6: Validate and append AI reply ──────────────────────
  if (typeof aiResponse.reply !== "string" || !aiResponse.reply.trim()) {
    const error = new Error("AI response is missing a valid reply");
    error.statusCode = 502;
    throw error;
  }

  session.messages.push({
    role: "assistant",
    content: aiResponse.reply.trim(),
  });

  // ── Step 7: If AI says done → validate → create complaint ─────
  let complaintId;
  let ticket;

  if (aiResponse.done === true) {
    // Don't create a duplicate if this session already has a complaint
    if (session.state?.complaintId) {
      complaintId = session.state.complaintId;
      ticket = toTicketPayload(await getComplaintByMongoId(complaintId));
    } else {
      const validation = validateComplaintFields(session.state);

      if (!validation.isValid) {
        // AI said done but required fields are missing.
        // Instead of crashing, keep the session alive and ask again.
        // Pop the "done" AI reply and replace with a clarification.
        session.messages.pop();

        const fallbackReply = buildClarificationReply(validation.missingFields);

        session.messages.push({
          role: "assistant",
          content: fallbackReply,
        });

        await session.save();

        return {
          reply: fallbackReply,
        };
      }

      // All required fields present → create complaint in MongoDB
      const complaint = await createComplaint({
        userId: session.userId,
        state: session.state,
      });

      complaintId = complaint._id.toString();
      ticket = toTicketPayload(complaint);
    }

    // Mark session as completed
    session.state = {
      ...session.state,
      complaintId,
      completed: true,
    };
  }

  // ── Step 8: Save session and return response ──────────────────
  await session.save();

  return {
    reply: aiResponse.reply.trim(),
    complaintId,
    ticket,
  };
};
