import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import mapStatsRoutes from "./routes/mapStats.routes.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import {
  errorMiddleware,
  notFoundMiddleware,
  requestLoggerMiddleware,
} from "./middleware/error.middleware.js";

const app = express();

// Validate and configure CORS with explicit origin
const configureCors = () => {
  const frontendUrl = process.env.FRONTEND_URL;
  const nodeEnv = process.env.NODE_ENV || "development";

  if (nodeEnv === "production" && !frontendUrl) {
    throw new Error(
      "FRONTEND_URL environment variable must be set in production"
    );
  }

  const allowedOrigins = frontendUrl
    ? [frontendUrl]
    : ["http://localhost:5173", "http://localhost:3000"];

  return {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};

app.use(cors(configureCors()));
app.use(express.json());
app.use(requestLoggerMiddleware);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/api/ready", (_req, res) => {
  res.status(200).json({ status: "ready" });
});

app.use("/api/auth", authRoutes);

// Public endpoints (no auth) — consumed by landing page
app.use("/api/map-stats", mapStatsRoutes);

// All protected application routes go through the Node backend only.
app.use("/api/chat", authMiddleware, chatRoutes);
app.use("/api/complaints", authMiddleware, complaintRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
