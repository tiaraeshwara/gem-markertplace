import { Response, NextFunction } from "express";
import { valuationsService } from "./valuations.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { z } from "zod";

const submitSchema = z.object({
  reservationId: z.string().uuid("Invalid reservation ID"),
  offeredPrice: z.coerce.number().positive("Offered price must be positive"),
  message: z.string().optional(),
});

export const valuationsController = {
  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = submitSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({
            message: "Validation error",
            errors: parsed.error.flatten(),
          });
        return;
      }
      const valuation = await valuationsService.submit(
        req.params.gemId,
        req.user!.id,
        parsed.data,
      );
      res.status(201).json(valuation);
    } catch (err) {
      next(err);
    }
  },

  async getGemValuations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const valuations = await valuationsService.getGemValuations(
        req.params.gemId,
        req.user!.id,
      );
      res.json(valuations);
    } catch (err) {
      next(err);
    }
  },

  async selectValuation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chatRoom = await valuationsService.selectValuation(
        req.params.id,
        req.user!.id,
      );
      res.json({ message: "Valuation selected, chat room created", chatRoom });
    } catch (err) {
      next(err);
    }
  },

  async myValuations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const valuations = await valuationsService.getBuyerValuations(
        req.user!.id,
      );
      res.json(valuations);
    } catch (err) {
      next(err);
    }
  },
};
