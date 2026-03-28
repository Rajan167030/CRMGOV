import { Router } from "express";
import { mapStatsController } from "../controllers/mapStats.controller.js";

const router = Router();

// Public endpoint — no auth required (consumed by landing page heatmap)
router.get("/", mapStatsController);

export default router;
