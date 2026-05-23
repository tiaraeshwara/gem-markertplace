import { Response, NextFunction } from "express";
import { reservationsService } from "./reservations.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

export const reservationsController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { gemId } = req.body;
      if (!gemId) {
        res.status(400).json({ message: "gemId is required" });
        return;
      }
      const reservation = await reservationsService.create(gemId, req.user!.id);
      res.status(201).json(reservation);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationsService.cancel(
        req.params.id,
        req.user!.id,
      );
      res.json(reservation);
    } catch (err) {
      next(err);
    }
  },

  async myReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservations = await reservationsService.getBuyerReservations(
        req.user!.id,
      );
      res.json(reservations);
    } catch (err) {
      next(err);
    }
  },

  async gemReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservations = await reservationsService.getGemReservations(
        req.params.gemId,
        req.user!.id,
      );
      res.json(reservations);
    } catch (err) {
      next(err);
    }
  },
};
