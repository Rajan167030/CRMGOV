const FASTAPI_CHAT_URL = process.env.FASTAPI_CHAT_URL || "http://localhost:8000/chat";

export const sendChatToAI = async ({ messages, state }) => {
  const response = await fetch(FASTAPI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      state,
    }),
  });

  if (!response.ok) {
    const error = new Error(`FastAPI request failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();

  if (
    !data ||
    typeof data.reply !== "string" ||
    typeof data.done !== "boolean" ||
    !data.state_update ||
    typeof data.state_update !== "object" ||
    Array.isArray(data.state_update)
  ) {
    const error = new Error("Invalid response format from FastAPI service");
    error.statusCode = 502;
    throw error;
  }

  return data;
};
