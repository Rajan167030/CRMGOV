import { Router } from "express";
import {
  createComplaintController,
  getComplaintController,
  listComplaintsController,
} from "../controllers/complaint.controller.js";

const router = Router();

router.post("/", createComplaintController);
router.get("/", listComplaintsController);
router.get("/:id", getComplaintController);

export default router;
