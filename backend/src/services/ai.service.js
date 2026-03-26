// ═══════════════════════════════════════════════════════════════
//  AI SERVICE — Bridge between Node backend and FastAPI AI model
//
//  Flow: chat.service → THIS FILE → FastAPI (black-box)
//
//  Strategy:
//   1) Prefer the grievance model endpoints (/api/complaint + /api/reply)
//   2) Only use the legacy /chat endpoint as a fallback for old local setups
//
//  The FastAPI service is treated as a BLACK BOX — never modified.
// ═══════════════════════════════════════════════════════════════

// ── Configuration ───────────────────────────────────────────────
const FASTAPI_CHAT_URL =
  process.env.FASTAPI_CHAT_URL || "http://localhost:8000/api/complaint";
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS, 10) || 10_000;

// ── Department mapping from AI intents ──────────────────────────
const DEPARTMENT_BY_INTENT = {
  WATER_SUPPLY: "Water",
  WATER_LOGGING: "Water",
  SEWER_ISSUE: "Water",
  DRAINAGE: "Water",
  SANITATION: "Sanitation",
  GARBAGE: "Sanitation",
  POLLUTION: "Sanitation",
  ROAD_ISSUE: "Roads",
  ENCROACHMENT: "Roads",
  TRAFFIC: "Transport",
  ELECTRICITY_ISSUE: "Electricity",
  STREETLIGHT_ISSUE: "Electricity",
  OTHER: "General",
  GENERAL: "General",
};

// ── Helpers ─────────────────────────────────────────────────────

const buildJsonHeaders = () => ({
  "Content-Type": "application/json",
});

const buildServiceUrls = () => {
  const configuredUrl = new URL(FASTAPI_CHAT_URL);
  const configuredPath = configuredUrl.pathname.replace(/\/+$/, "");
  const origin = configuredUrl.origin;
  const isConfiguredForLegacyChat = configuredPath === "/chat";

  return {
    legacyChatUrl: `${origin}/chat`,
    isConfiguredForLegacyChat,
    grievanceComplaintUrl:
      configuredPath === "/api/complaint"
        ? configuredUrl.toString()
        : `${origin}/api/complaint`,
    grievanceReplyUrl:
      configuredPath === "/api/reply"
        ? configuredUrl.toString()
        : `${origin}/api/reply`,
  };
};

const createGatewayError = (message) => {
  const error = new Error(message);
  error.statusCode = 502;
  return error;
};

/**
 * Create an AbortSignal that times out after AI_TIMEOUT_MS.
 * Falls back to a manual AbortController for older Node versions.
 */
const createTimeoutSignal = () => {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(AI_TIMEOUT_MS);
  }

  // Fallback for Node < 17.3
  const controller = new AbortController();
  setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  return controller.signal;
};

// ── Response validation ─────────────────────────────────────────

const assertLegacyChatResponse = (data) => {
  if (
    !data ||
    typeof data.reply !== "string" ||
    typeof data.done !== "boolean" ||
    !data.state_update ||
    typeof data.state_update !== "object" ||
    Array.isArray(data.state_update)
  ) {
    throw createGatewayError("Invalid response format from FastAPI /chat service");
  }

  return data;
};

// ── Department / priority mapping ───────────────────────────────

const mapGrievanceDepartment = (response) => {
  if (typeof response?.department === "string" && response.department.trim()) {
    return response.department.trim();
  }

  return DEPARTMENT_BY_INTENT[response?.intent] || "General";
};

// ── Hinglish detection (bilingual support) ──────────────────────

const looksLikeHinglish = (text) => {
  if (typeof text !== "string") {
    return false;
  }

  const normalized = text.toLowerCase();
  const hinglishMarkers = [
    "mujhe",
    "mera",
    "meri",
    "ghar",
    "yaha",
    "yahan",
    "hai",
    "nahi",
    "nahin",
    "kuda",
    "kachra",
    "sadak",
    "paani",
    "bijli",
    "ke aage",
  ];

  return hinglishMarkers.some((marker) => normalized.includes(marker));
};

// ── Slot sanitization (guards against hallucinated values) ──────

const INVALID_SLOT_VALUES = new Set([
  "hello",
  "hi",
  "hey",
  "ok",
  "okay",
  "thanks",
  "thank you",
  "hlo",
]);

const normalizeSlotValue = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const lowered = normalized.toLowerCase();
  if (INVALID_SLOT_VALUES.has(lowered)) {
    return undefined;
  }

  return normalized;
};

const normalizeLocationValue = (value) => {
  const normalized = normalizeSlotValue(value);
  if (!normalized) {
    return undefined;
  }

  const lowered = normalized.toLowerCase();
  if (lowered.length < 3) {
    return undefined;
  }
  if (["hello", "hi", "hey", "plastic", "kuda", "kachra"].includes(lowered)) {
    return undefined;
  }

  return normalized;
};

const extractLineValue = (text, label) => {
  if (typeof text !== "string" || !text.trim()) {
    return undefined;
  }

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escapedLabel}\\s*:\\s*(.+)`, "i"));
  return match?.[1]?.trim() || undefined;
};

const extractTicketId = (text, data) => {
  const directTicketId =
    normalizeSlotValue(data?.ticket_id) ||
    normalizeSlotValue(data?.ticketId) ||
    normalizeSlotValue(data?.complaint_id) ||
    normalizeSlotValue(data?.complaintId);

  if (directTicketId) {
    return directTicketId;
  }

  const fromReply = extractLineValue(text, "Ticket ID");
  return normalizeSlotValue(fromReply);
};

const extractStructuredReplyFields = (reply, data) => {
  const description =
    extractLineValue(reply, "Details") ||
    extractLineValue(reply, "Description") ||
    extractLineValue(reply, "Complaint");
  const location = extractLineValue(reply, "Location");
  const department =
    extractLineValue(reply, "Department") || extractLineValue(reply, "Issue");

  return {
    ticketId: extractTicketId(reply, data),
    complaint: normalizeSlotValue(description),
    location: normalizeLocationValue(location),
    department: normalizeSlotValue(department),
  };
};

// ── Fallback questions when AI returns incomplete data ───────────

const buildFallbackQuestion = ({ slots, missingFields, sourceText }) => {
  const missing = Array.isArray(missingFields) ? missingFields : [];
  const isHinglish = looksLikeHinglish(sourceText);
  const safeLocation = normalizeLocationValue(slots?.LOCATION);

  if (missing.includes("LOCATION")) {
    return isHinglish
      ? "Thik hai. Exact location ya koi landmark bata dijiye."
      : "Please share the exact location or a nearby landmark.";
  }

  if (missing.includes("DESCRIPTION")) {
    return isHinglish
      ? "Issue ko thoda aur clearly bata dijiye."
      : "Please describe the issue a bit more clearly.";
  }

  if (missing.includes("KNO")) {
    return isHinglish
      ? "Agar available ho to apna KNO number bhej dijiye."
      : "If available, please share your KNO number.";
  }

  if (safeLocation) {
    return isHinglish
      ? `Samajh gaya. Location ${safeLocation} note kar li hai. Thoda aur detail bata dijiye.`
      : `Understood. I noted the location as ${safeLocation}. Please share a little more detail.`;
  }

  return isHinglish
    ? "Samajh gaya. Complaint register karne ke liye thodi aur detail bhej dijiye."
    : "Understood. Please share a little more detail so I can register the complaint.";
};

// ── Map grievance API response → normalized chat response ───────

const mapGrievanceToChatResponse = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw createGatewayError("Invalid response format from grievance AI service");
  }

  const reply =
    (typeof data.final_message === "string" && data.final_message.trim()) ||
    (typeof data.question === "string" && data.question.trim()) ||
    "I processed your complaint update.";

  const slots =
    data.slots && typeof data.slots === "object" && !Array.isArray(data.slots)
      ? data.slots
      : {};
  const parsedReplyFields = extractStructuredReplyFields(reply, data);
  const complaint =
    normalizeSlotValue(slots.DESCRIPTION) || parsedReplyFields.complaint;
  const location =
    normalizeLocationValue(slots.LOCATION) || parsedReplyFields.location;
  const department =
    parsedReplyFields.department || mapGrievanceDepartment(data);
  const ticketId = parsedReplyFields.ticketId;

  const fallbackQuestion = buildFallbackQuestion({
    slots,
    missingFields: data.missing_fields,
    sourceText: complaint || "",
  });

  return {
    reply:
      reply === "I processed your complaint update." ? fallbackQuestion : reply,
    done: Boolean(ticketId),
    aiSessionId:
      typeof data.session_id === "string" && data.session_id.trim()
        ? data.session_id.trim()
        : undefined,
    state_update: {
      complaint,
      department,
      location,
      priority: "Medium",
      ticketId,
    },
  };
};

// ═══════════════════════════════════════════════════════════════
//  FETCH WRAPPERS — call FastAPI with timeout + error handling
// ═══════════════════════════════════════════════════════════════

const sendToLegacyChatService = async ({ messages, state, legacyChatUrl }) => {
  let response;
  try {
    response = await fetch(legacyChatUrl, {
      method: "POST",
      headers: buildJsonHeaders(),
      signal: createTimeoutSignal(),
      body: JSON.stringify({
        messages,
        state,
      }),
    });
  } catch (fetchError) {
    // Handle timeout and network errors
    if (fetchError.name === "TimeoutError" || fetchError.name === "AbortError") {
      throw createGatewayError(
        "AI service did not respond in time. Please try again."
      );
    }
    throw createGatewayError(
      "Unable to reach the AI service. Please try again later."
    );
  }

  if (!response.ok) {
    const error = createGatewayError(
      `FastAPI /chat request failed with status ${response.status}`
    );
    error.upstreamStatus = response.status;
    throw error;
  }

  return assertLegacyChatResponse(await response.json());
};

const sendToGrievanceService = async ({
  message,
  messages,
  state,
  grievanceComplaintUrl,
  grievanceReplyUrl,
}) => {
  const hasRemoteSession =
    typeof state?.aiSessionId === "string" && state.aiSessionId.trim();

  const url = hasRemoteSession ? grievanceReplyUrl : grievanceComplaintUrl;
  const body = hasRemoteSession
    ? {
        session_id: state.aiSessionId.trim(),
        text: message,
        conversation_history: messages.map(({ role, content }) => ({
          role,
          content,
        })),
      }
    : {
        text: message,
      };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: buildJsonHeaders(),
      signal: createTimeoutSignal(),
      body: JSON.stringify(body),
    });
  } catch (fetchError) {
    // Handle timeout and network errors
    if (fetchError.name === "TimeoutError" || fetchError.name === "AbortError") {
      throw createGatewayError(
        "AI service did not respond in time. Please try again."
      );
    }
    throw createGatewayError(
      "Unable to reach the AI service. Please try again later."
    );
  }

  if (!response.ok) {
    throw createGatewayError(
      `Grievance AI request failed with status ${response.status}`
    );
  }

  return mapGrievanceToChatResponse(await response.json());
};

// ═══════════════════════════════════════════════════════════════
//  PUBLIC API — called by chat.service.js
//
//  Strategy: use grievance endpoints by default, fall back to legacy /chat only
//  when the service is explicitly configured for it or grievance returns 404.
// ═══════════════════════════════════════════════════════════════

export const sendChatToAI = async ({ message, messages, state }) => {
  const urls = buildServiceUrls();

  try {
    return await sendToGrievanceService({
      message,
      messages,
      state,
      grievanceComplaintUrl: urls.grievanceComplaintUrl,
      grievanceReplyUrl: urls.grievanceReplyUrl,
    });
  } catch (error) {
    if (!urls.isConfiguredForLegacyChat && error?.upstreamStatus !== 404) {
      throw error;
    }
  }

  return sendToLegacyChatService({
    messages,
    state,
    legacyChatUrl: urls.legacyChatUrl,
  });
};
