import { Router } from "express";
import { chatController } from "./chat.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, chatController.getRooms);
router.get("/:roomId/messages", authenticate, chatController.getMessages);
router.post("/:roomId/messages", authenticate, chatController.sendMessage);

export default router;
