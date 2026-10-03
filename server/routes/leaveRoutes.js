import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  applyLeave,
  getLeaves,
  getMyLeaves,
  getEmployeeLeaves,
  getLeave,
  updateLeave,
  updateLeaveStatus,
  deleteLeave,
} from "../controllers/leaveController.js";

const router = express.Router();

router.post(
  "/apply",
  authMiddleware,
  applyLeave
);

router.get(
  "/my-leave",
  authMiddleware,
  getMyLeaves
);

router.put(
  "/edit/:id",
  authMiddleware,
  updateLeave
);

router.get(
  "/",
  authMiddleware,
  getLeaves
);

router.get(
  "/employee/:id",
  authMiddleware,
  getEmployeeLeaves
);

router.put(
  "/:id/status",
  authMiddleware,
  updateLeaveStatus
);

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteLeave
);

router.get(
  "/:id",
  authMiddleware,
  getLeave
);

export default router;