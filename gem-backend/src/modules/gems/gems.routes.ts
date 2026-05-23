import { Router } from "express";
import { gemsController } from "./gems.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import {
  uploadImages,
  uploadCertificate,
} from "../../middleware/upload.middleware";

const router = Router();

// Public routes
router.get("/", gemsController.list);
router.get("/my", authenticate, authorize("seller"), gemsController.myGems);
router.get("/:id", gemsController.getOne);

// Seller routes
router.post("/", authenticate, authorize("seller"), gemsController.create);
router.put("/:id", authenticate, authorize("seller"), gemsController.update);
router.delete("/:id", authenticate, authorize("seller"), gemsController.remove);
router.post(
  "/:id/submit",
  authenticate,
  authorize("seller"),
  gemsController.submitForReview,
);

// Image management
router.post(
  "/:id/images",
  authenticate,
  authorize("seller"),
  uploadImages.array("images", 10),
  gemsController.addImages,
);
router.delete(
  "/:id/images/:imageId",
  authenticate,
  authorize("seller"),
  gemsController.removeImage,
);

// Certificate upload
router.post(
  "/:id/certificate",
  authenticate,
  authorize("seller"),
  uploadCertificate.single("certificate"),
  gemsController.uploadCertificate,
);

export default router;
