const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const getToken = () => localStorage.getItem("ps_crm_token");

const buildHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const loginRequest = async ({ email, password, role }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ email, password, role }),
  });

  return parseJsonResponse(response);
};

export const registerRequest = async ({ name, email, password, phone, role }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ name, email, password, phone, role }),
  });

  return parseJsonResponse(response);
};

export const fetchCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: buildHeaders(),
  });

  return parseJsonResponse(response);
};

export const createChatSession = async () => {
  const response = await fetch(`${API_BASE_URL}/api/chat/session`, {
    method: "POST",
    headers: buildHeaders(),
  });

  return parseJsonResponse(response);
};

export const sendChatMessage = async ({ sessionId, message }) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      sessionId,
      message,
    }),
  });

  return parseJsonResponse(response);
};

export const fetchComplaints = async () => {
  const response = await fetch(`${API_BASE_URL}/api/complaints`, {
    headers: buildHeaders(),
  });

  return parseJsonResponse(response);
};

export const fetchComplaintById = async ({ complaintId }) => {
  const response = await fetch(`${API_BASE_URL}/api/complaints/${complaintId}`, {
    headers: buildHeaders(),
  });

  return parseJsonResponse(response);
};
