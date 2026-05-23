import { Router } from "express";
import { Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { notificationService } from "../../services/notification.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const notifications = await notificationService.getUserNotifications(
        req.user!.id,
      );
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/read-all",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await notificationService.markAllRead(req.user!.id);
      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/:id/read",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await notificationService.markOneRead(req.params.id, req.user!.id);
      res.json({ message: "Notification marked as read" });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
