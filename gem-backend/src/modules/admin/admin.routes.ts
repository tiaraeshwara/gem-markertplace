import { Router } from "express";
import { adminController } from "./admin.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize("admin"));

router.get("/dashboard", adminController.getDashboard);
router.get("/gems/pending", adminController.getPendingGems);
router.get("/gems", adminController.getAllGems);
router.put("/gems/:id/approve", adminController.approveGem);
router.put("/gems/:id/reject", adminController.rejectGem);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/toggle-status", adminController.toggleUserStatus);
router.get("/chats", adminController.getChatRooms);

export default router;
