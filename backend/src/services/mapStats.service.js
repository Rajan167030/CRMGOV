// ═══════════════════════════════════════════════════════════════
//  MAP STATS SERVICE — Aggregation pipeline for complaint heatmap
//
//  Returns complaint counts grouped by location and department,
//  optimised for the Delhi choropleth map on the landing page.
//
//  Supports time-based filtering via the `timeframe` parameter:
//    "24h" | "7d" | "30d" | "all" (default)
// ═══════════════════════════════════════════════════════════════

import { Complaint } from "../models/complaint.model.js";

// ── Timeframe → milliseconds mapping ────────────────────────────
const TIMEFRAME_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/**
 * Build the $match stage for the aggregation pipeline.
 * Always excludes resolved complaints; optionally filters by createdAt.
 */
const buildMatchStage = (timeframe) => {
  const match = { status: { $ne: "Resolved" } };

  const ms = TIMEFRAME_MS[timeframe];
  if (ms) {
    match.createdAt = { $gte: new Date(Date.now() - ms) };
  }
  // "all" or undefined → no createdAt filter

  return { $match: match };
};

/**
 * Aggregate active (non-resolved) complaints by location + department.
 *
 * @param {Object} options
 * @param {string} [options.timeframe="all"] — "24h" | "7d" | "30d" | "all"
 *
 * Output shape per entry:
 *   { location, total, departments: [{ name, count }], topDepartment }
 */
export const getMapStats = async ({ timeframe = "all" } = {}) => {
  const pipeline = [
    // 1. Filter: active complaints + optional time window
    buildMatchStage(timeframe),

    // 2. Group by (location, department) → count
    {
      $group: {
        _id: { location: "$location", department: "$department" },
        count: { $sum: 1 },
      },
    },

    // 3. Re-group by location → push department breakdown
    {
      $group: {
        _id: "$_id.location",
        total: { $sum: "$count" },
        departments: {
          $push: { name: "$_id.department", count: "$count" },
        },
      },
    },

    // 4. Sort by complaint volume (heaviest first)
    { $sort: { total: -1 } },

    // 5. Project clean output
    {
      $project: {
        _id: 0,
        location: "$_id",
        total: 1,
        departments: 1,
      },
    },
  ];

  const results = await Complaint.aggregate(pipeline);

  // Attach topDepartment (the department with the most complaints per location)
  return results.map((entry) => {
    const sorted = [...entry.departments].sort((a, b) => b.count - a.count);
    return {
      ...entry,
      topDepartment: sorted[0]?.name || "General",
    };
  });
};
