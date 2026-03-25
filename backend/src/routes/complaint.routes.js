import { Router } from "express";
import {
  getComplaintController,
  listComplaintsController,
} from "../controllers/complaint.controller.js";

const router = Router();

router.get("/", listComplaintsController);
router.get("/:id", getComplaintController);

export default router;
