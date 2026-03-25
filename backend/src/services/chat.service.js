import mongoose from "mongoose";
import { Session } from "../models/session.model.js";
import { sendChatToAI } from "./ai.service.js";
import { createComplaint } from "./complaint.service.js";
import {
  sanitizeStateUpdate,
  validateComplaintFields,
} from "../utils/validator.js";

const MAX_MESSAGES = 10;

const createEmptySession = async (sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    throw error;
  }

  return session;
};

export const createSession = async (userId) => {
  return Session.create({
    userId,
    state: {},
    messages: [],
  });
};

export const processMessage = async (sessionId, message) => {
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

  const session = await createEmptySession(sessionId);

  if (session.state?.completed) {
    const error = new Error("This session is already completed");
    error.statusCode = 409;
    throw error;
  }

  if (session.messages.length + 2 > MAX_MESSAGES) {
    const error = new Error("Conversation message limit reached");
    error.statusCode = 400;
    throw error;
  }

  // Store the user's message before the AI call so the model sees the full history.
  session.messages.push({
    role: "user",
    content: message.trim(),
  });

  const aiResponse = await sendChatToAI({
    messages: session.messages,
    state: session.state || {},
  });

  const stateUpdate = sanitizeStateUpdate(aiResponse.state_update);

  // Merge the latest extracted fields into the persisted session state.
  session.state = {
    ...(session.state || {}),
    ...stateUpdate,
  };

  if (typeof aiResponse.reply !== "string" || !aiResponse.reply.trim()) {
    const error = new Error("AI response is missing a valid reply");
    error.statusCode = 502;
    throw error;
  }

  session.messages.push({
    role: "assistant",
    content: aiResponse.reply.trim(),
  });

  let complaintId;

  if (aiResponse.done === true) {
    if (session.state?.complaintId) {
      complaintId = session.state.complaintId;
    } else {
      const validation = validateComplaintFields(session.state);

      if (!validation.isValid) {
        const error = new Error(
          `AI marked conversation done before collecting: ${validation.missingFields.join(", ")}`
        );
        error.statusCode = 400;
        throw error;
      }

      // Persist the complaint only after required structured fields are validated.
      const complaint = await createComplaint({
        userId: session.userId,
        state: session.state,
      });

      complaintId = complaint._id.toString();
    }

    session.state = {
      ...session.state,
      complaintId,
      completed: true,
    };
  }

  await session.save();

  return {
    reply: aiResponse.reply.trim(),
    complaintId,
  };
};
