import { Router } from "express";
import {
  postMessageController,
  startSessionController,
} from "../controllers/chat.controller.js";

const router = Router();

router.post("/session", startSessionController);
router.post("/message", postMessageController);

export default router;
