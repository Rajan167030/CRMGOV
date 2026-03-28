const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || "http://localhost:8000";
const AI_TIMEOUT_MS = 30000; // 30 seconds

const getToken = () => localStorage.getItem("ps_crm_token");

const buildHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const extractErrorMessage = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => ({}));

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const firstError = data.errors[0];

      if (typeof firstError === "string") {
        return firstError;
      }

      if (typeof firstError?.message === "string") {
        return firstError.message;
      }
    }

    return "Request failed";
  }

  const text = await response.text().catch(() => "");
  return text.trim() || "Request failed";
};

const parseJsonResponse = async (response) => {
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    const error = new Error(message);
    error.status = response.status;
    console.error("API request failed", {
      status: response.status,
      statusText: response.statusText,
      message,
      url: response.url,
    });
    throw error;
  }

  try {
    return await response.json();
  } catch (error) {
    const errorInfo = {
      url: response.url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      parseError: error.message,
    };
    console.error("Failed to parse JSON response", errorInfo);
    return {}; // Return safe empty object as fallback
  }
};

const apiRequest = async (path, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    return await parseJsonResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error(
        "Unable to reach the backend. Check that the frontend proxy and backend server are running."
      );
      networkError.cause = error;
      console.error("Network request failed", {
        path,
        message: error.message,
      });
      throw networkError;
    }

    console.error("Unhandled API error", {
      path,
      message: error.message,
      status: error.status,
    });
    throw error;
  }
};

export const loginRequest = async ({ email, password }) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
};

export const registerRequest = async ({ name, email, password, phone }) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ name, email, password, phone }),
  });
};

export const fetchCurrentUser = async () => {
  return apiRequest("/api/auth/me", {
    headers: buildHeaders(),
  });
};

export const createChatSession = async () => {
  return apiRequest("/api/chat/session", {
    method: "POST",
    headers: buildHeaders(),
  });
};

export const sendChatMessage = async ({ sessionId, message }) => {
  return apiRequest("/api/chat/message", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      sessionId,
      message,
    }),
  });
};

const aiRequest = async (path, body) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const response = await fetch(`${AI_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await parseJsonResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "AI service request timed out. Please try again."
      );
      timeoutError.cause = error;
      throw timeoutError;
    }

    if (error instanceof TypeError) {
      const networkError = new Error(
        "Unable to reach the grievance model on localhost:8000."
      );
      networkError.cause = error;
      throw networkError;
    }

    throw error;
  }
};

export const startModelComplaintChat = async ({ text, sessionId }) => {
  return aiRequest("/api/complaint", {
    text,
    session_id: sessionId || null,
  });
};

export const continueModelComplaintChat = async ({
  sessionId,
  text,
  conversationHistory = [],
}) => {
  return aiRequest("/api/reply", {
    session_id: sessionId,
    text,
    conversation_history: conversationHistory,
  });
};

export const saveComplaintRequest = async ({
  complaint,
  department,
  location,
  priority,
  ticketId,
}) => {
  return apiRequest("/api/complaints", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      complaint,
      department,
      location,
      priority,
      ticketId,
    }),
  });
};

export const fetchComplaints = async () => {
  return apiRequest("/api/complaints", {
    headers: buildHeaders(),
  });
};

export const fetchComplaintById = async ({ complaintId }) => {
  return apiRequest(`/api/complaints/${complaintId}`, {
    headers: buildHeaders(),
  });
};
