import { createServer } from "node:http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDefaultUsers } from "./services/auth.service.js";
import { initSocket } from "./services/socket.service.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Attempt MongoDB connection — warn but don't crash if it fails
  try {
    await connectDB();
    await seedDefaultUsers();
  } catch (dbError) {
    console.warn(
      "⚠️  MongoDB connection failed — server will start in offline/mock mode.",
      dbError.message
    );
  }

  // Create HTTP server wrapping Express (needed for Socket.io)
  const httpServer = createServer(app);

  // Attach Socket.io to the HTTP server
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
};

startServer();
