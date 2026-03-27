import { createSession, processMessage } from "../services/chat.service.js";

export const startSessionController = async (req, res, next) => {
  try {
    // Create an empty conversation session bound to the authenticated user.
    const session = await createSession(req.user.id);

    res.status(201).json({
      sessionId: session._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

export const postMessageController = async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;

    // Validate required inputs
    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      return res.status(400).json({
        message: "sessionId is required and must be a non-empty string",
      });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "message is required and must be a non-empty string",
      });
    }

    const result = await processMessage(sessionId, message);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
