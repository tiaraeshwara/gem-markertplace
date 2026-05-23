import { Router } from "express";
import { valuationsController } from "./valuations.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// Gem-scoped valuations
router.post(
  "/gems/:gemId/valuations",
  authenticate,
  authorize("buyer"),
  valuationsController.submit,
);
router.get(
  "/gems/:gemId/valuations",
  authenticate,
  authorize("seller"),
  valuationsController.getGemValuations,
);

// Valuation actions
router.put(
  "/valuations/:id/select",
  authenticate,
  authorize("seller"),
  valuationsController.selectValuation,
);
router.get(
  "/valuations/my",
  authenticate,
  authorize("buyer"),
  valuationsController.myValuations,
);

export default router;
