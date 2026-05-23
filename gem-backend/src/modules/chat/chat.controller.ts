import { Response, NextFunction } from "express";
import { chatService } from "./chat.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

export const chatController = {
  async getRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rooms = await chatService.getUserRooms(req.user!.id);
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await chatService.getRoomMessages(
        req.params.roomId,
        req.user!.id,
        page,
        limit,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      if (!content || content.trim() === "") {
        res.status(400).json({ message: "Message content is required" });
        return;
      }
      const message = await chatService.sendMessage(
        req.params.roomId,
        req.user!.id,
        content.trim(),
      );
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },
};
