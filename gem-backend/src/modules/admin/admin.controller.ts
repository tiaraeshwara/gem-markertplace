import { Response, NextFunction } from "express";
import { adminService } from "./admin.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(5, "Rejection reason must be at least 5 characters"),
});

export const adminController = {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getPendingGems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gems = await adminService.getPendingGems();
      res.json(gems);
    } catch (err) {
      next(err);
    }
  },

  async getAllGems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const gems = await adminService.getAllGems(status);
      res.json(gems);
    } catch (err) {
      next(err);
    }
  },

  async approveGem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gem = await adminService.approveGem(req.params.id, req.user!.id);
      res.json({ message: "Gem approved", gem });
    } catch (err) {
      next(err);
    }
  },

  async rejectGem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = rejectSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      const gem = await adminService.rejectGem(
        req.params.id,
        req.user!.id,
        parsed.data.reason,
      );
      res.json({ message: "Gem rejected", gem });
    } catch (err) {
      next(err);
    }
  },

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as string | undefined;
      const users = await adminService.getAllUsers(role);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.toggleUserStatus(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async getChatRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rooms = await adminService.getAllChatRooms();
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  },
};
