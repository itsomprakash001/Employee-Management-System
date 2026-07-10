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

// ================= EMPLOYEE =================

// Apply Leave
router.post("/apply", authMiddleware, applyLeave);

// Logged-in employee leave history
router.get("/my-leave", authMiddleware, getMyLeaves);

// Edit Pending Leave
router.put("/edit/:id", authMiddleware, updateLeave);

// ================= ADMIN =================

// Get all leave requests
router.get("/", authMiddleware, getLeaves);

// Get leaves of a particular employee
router.get("/employee/:id", authMiddleware, getEmployeeLeaves);

// Get single leave
router.get("/:id", authMiddleware, getLeave);

// Approve / Reject Leave
router.put("/:id", authMiddleware, updateLeaveStatus);


router.delete("/delete/:id", authMiddleware, deleteLeave);



export default router;