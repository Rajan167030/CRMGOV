import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

// All protected application routes go through the Node backend only.
app.use("/api/chat", authMiddleware, chatRoutes);
app.use("/api/complaints", authMiddleware, complaintRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
