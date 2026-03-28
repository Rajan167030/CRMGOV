// ═══════════════════════════════════════════════════════════════
//  SOCKET SERVICE — Real-time complaint updates via Socket.io
//
//  • Attaches to the HTTP server (shares port with Express)
//  • Emits `new_complaint` events for live map updates
//  • Includes a demo simulator (setInterval) for testing
//  • Exposes emitNewComplaint() for use by other services
// ═══════════════════════════════════════════════════════════════

import { Server } from "socket.io";
import cache, { MAP_STATS_PREFIX } from "./cache.service.js";

// ── Demo data for the simulator ─────────────────────────────────
const DEMO_LOCATIONS = [
  "Rohini",
  "Dwarka",
  "Laxmi Nagar",
  "Saket",
  "Connaught Place",
  "Shahdara",
  "Karol Bagh",
  "Seelampur",
  "Okhla",
  "Janakpuri",
  "Palam",
  "Narela",
  "Civil Lines",
  "South West Delhi",
];

const DEMO_DEPARTMENTS = ["DJB", "MCD", "PWD", "CPGRAMS"];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Singleton reference ─────────────────────────────────────────
let ioInstance = null;
let simulatorInterval = null;

/**
 * Initialize Socket.io on the given HTTP server.
 * Call this ONCE during server startup.
 */
export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Reduce overhead for map updates
    transports: ["websocket", "polling"],
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[socket] Client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  // Start the demo simulator (emits every 15 seconds)
  startDemoSimulator();

  console.log("[socket] Socket.io initialized");
  return ioInstance;
};

/**
 * Get the current Socket.io instance.
 */
export const getIO = () => ioInstance;

/**
 * Emit a new_complaint event to all connected clients.
 * Called by the demo simulator or by real complaint creation flow.
 *
 * @param {{ location: string, department: string }} data
 */
export const emitNewComplaint = (data) => {
  if (!ioInstance) return;

  const event = {
    location: data.location,
    department: data.department,
    timestamp: new Date().toISOString(),
  };

  ioInstance.emit("new_complaint", event);

  // Invalidate all cached map-stats (every timeframe variant)
  cache.invalidateByPrefix(MAP_STATS_PREFIX);
};

// ── Demo simulator — random complaints every 15 seconds ─────────
const startDemoSimulator = () => {
  if (simulatorInterval) clearInterval(simulatorInterval);

  simulatorInterval = setInterval(() => {
    const location = pickRandom(DEMO_LOCATIONS);
    const department = pickRandom(DEMO_DEPARTMENTS);

    emitNewComplaint({ location, department });

    console.log(
      `[socket] Demo complaint → ${department} @ ${location}`
    );
  }, 15_000);
};

/**
 * Stop the demo simulator (call on shutdown).
 */
export const stopDemoSimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
};
