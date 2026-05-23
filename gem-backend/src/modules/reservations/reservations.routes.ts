import { Router } from "express";
import { reservationsController } from "./reservations.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("buyer"),
  reservationsController.create,
);
router.delete(
  "/:id",
  authenticate,
  authorize("buyer"),
  reservationsController.cancel,
);
router.get(
  "/my",
  authenticate,
  authorize("buyer"),
  reservationsController.myReservations,
);
router.get(
  "/gem/:gemId",
  authenticate,
  authorize("seller"),
  reservationsController.gemReservations,
);

export default router;
