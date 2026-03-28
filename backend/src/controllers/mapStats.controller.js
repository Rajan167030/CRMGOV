// ═══════════════════════════════════════════════════════════════
//  MAP STATS CONTROLLER — with graceful mock-data fallback
//
//  If MongoDB is unreachable (ECONNREFUSED, timeout, topology
//  closed, etc.) we return realistic mock data so the frontend
//  UI can be developed and tested without a live database.
// ═══════════════════════════════════════════════════════════════

import { getMapStats } from "../services/mapStats.service.js";
import cache, { MAP_STATS_PREFIX } from "../services/cache.service.js";

// ── Mock data that mirrors the exact aggregation output shape ──
const MOCK_STATS = [
  {
    location: "Rohini",
    total: 42,
    departments: [
      { name: "DJB", count: 18 },
      { name: "MCD", count: 14 },
      { name: "PWD", count: 7 },
      { name: "CPGRAMS", count: 3 },
    ],
    topDepartment: "DJB",
  },
  {
    location: "Dwarka",
    total: 37,
    departments: [
      { name: "MCD", count: 16 },
      { name: "DJB", count: 12 },
      { name: "PWD", count: 9 },
    ],
    topDepartment: "MCD",
  },
  {
    location: "South West Delhi",
    total: 31,
    departments: [
      { name: "PWD", count: 15 },
      { name: "MCD", count: 10 },
      { name: "DJB", count: 6 },
    ],
    topDepartment: "PWD",
  },
  {
    location: "Laxmi Nagar",
    total: 28,
    departments: [
      { name: "DJB", count: 20 },
      { name: "CPGRAMS", count: 5 },
      { name: "MCD", count: 3 },
    ],
    topDepartment: "DJB",
  },
  {
    location: "Saket",
    total: 25,
    departments: [
      { name: "MCD", count: 12 },
      { name: "PWD", count: 8 },
      { name: "DJB", count: 5 },
    ],
    topDepartment: "MCD",
  },
  {
    location: "Connaught Place",
    total: 22,
    departments: [
      { name: "CPGRAMS", count: 10 },
      { name: "MCD", count: 7 },
      { name: "PWD", count: 5 },
    ],
    topDepartment: "CPGRAMS",
  },
  {
    location: "Shahdara",
    total: 19,
    departments: [
      { name: "DJB", count: 9 },
      { name: "MCD", count: 6 },
      { name: "PWD", count: 4 },
    ],
    topDepartment: "DJB",
  },
  {
    location: "Karol Bagh",
    total: 17,
    departments: [
      { name: "PWD", count: 8 },
      { name: "DJB", count: 5 },
      { name: "CPGRAMS", count: 4 },
    ],
    topDepartment: "PWD",
  },
  {
    location: "Civil Lines",
    total: 15,
    departments: [
      { name: "MCD", count: 8 },
      { name: "DJB", count: 4 },
      { name: "CPGRAMS", count: 3 },
    ],
    topDepartment: "MCD",
  },
  {
    location: "Seelampur",
    total: 33,
    departments: [
      { name: "DJB", count: 15 },
      { name: "MCD", count: 11 },
      { name: "PWD", count: 5 },
      { name: "CPGRAMS", count: 2 },
    ],
    topDepartment: "DJB",
  },
  {
    location: "Okhla",
    total: 20,
    departments: [
      { name: "PWD", count: 9 },
      { name: "MCD", count: 6 },
      { name: "DJB", count: 5 },
    ],
    topDepartment: "PWD",
  },
  {
    location: "Janakpuri",
    total: 14,
    departments: [
      { name: "MCD", count: 6 },
      { name: "DJB", count: 5 },
      { name: "PWD", count: 3 },
    ],
    topDepartment: "MCD",
  },
  {
    location: "Palam",
    total: 11,
    departments: [
      { name: "DJB", count: 5 },
      { name: "PWD", count: 4 },
      { name: "MCD", count: 2 },
    ],
    topDepartment: "DJB",
  },
  {
    location: "Narela",
    total: 8,
    departments: [
      { name: "MCD", count: 4 },
      { name: "DJB", count: 3 },
      { name: "CPGRAMS", count: 1 },
    ],
    topDepartment: "MCD",
  },
];

// ── Check if an error is a DB connectivity issue ────────────────
const isDbConnectionError = (error) => {
  if (!error) return false;

  const message = (error.message || "").toLowerCase();
  const code = error.code || "";

  const DB_ERROR_PATTERNS = [
    "econnrefused",
    "enotfound",
    "etimedout",
    "econnreset",
    "topology was destroyed",
    "topology is closed",
    "server selection timed out",
    "connect econnrefused",
    "querysrv enotfound",
    "buffering timed out",
    "not connected",
    "mongoserverselectionerror",
    "mongosservererror",
  ];

  return DB_ERROR_PATTERNS.some(
    (pattern) => message.includes(pattern) || String(code).toLowerCase().includes(pattern)
  );
};

// ── Allowed timeframe values ──────────────────────────────────
const ALLOWED_TIMEFRAMES = new Set(["24h", "7d", "30d", "all"]);
const CACHE_TTL_SECONDS = 300; // 5 minutes

// ═══════════════════════════════════════════════════════════════
//  CONTROLLER — Cache → DB → Mock fallback
// ═══════════════════════════════════════════════════════════════

export const mapStatsController = async (req, res, next) => {
  // Parse and validate timeframe from query string
  const rawTimeframe = (req.query.timeframe || "all").toLowerCase().trim();
  const timeframe = ALLOWED_TIMEFRAMES.has(rawTimeframe) ? rawTimeframe : "all";

  // 1️⃣  Check cache first
  const cacheKey = `${MAP_STATS_PREFIX}${timeframe}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res
      .status(200)
      .json({ stats: cached, source: "live", timeframe, cached: true });
  }

  // 2️⃣  Cache miss — try the database
  try {
    const stats = await getMapStats({ timeframe });

    // Populate cache for 5 minutes
    cache.set(cacheKey, stats, CACHE_TTL_SECONDS);

    res
      .status(200)
      .json({ stats, source: "live", timeframe, cached: false });
  } catch (error) {
    // 3️⃣  DB connectivity issue → serve mock data (not cached)
    if (isDbConnectionError(error)) {
      console.warn(
        "[map-stats] MongoDB unreachable — serving mock data.",
        error.message
      );
      return res
        .status(200)
        .json({ stats: MOCK_STATS, source: "mock", timeframe, cached: false });
    }

    // Any other error → Express error handler
    next(error);
  }
};
