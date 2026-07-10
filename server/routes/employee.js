import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addEmployee,
  upload,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeProfile,
} from "../controllers/employeeController.js";

const router = express.Router();

// Get all employees
router.get("/", authMiddleware, getEmployees);

// Add employee
router.post(
  "/add",
  authMiddleware,
  upload.single("image"),
  addEmployee
);

// Logged-in employee profile
router.get("/profile/me", authMiddleware, getEmployeeProfile);

// Get single employee
router.get("/:id", authMiddleware, getEmployee);

// Update employee
router.put("/:id", authMiddleware, updateEmployee);

// Delete employee
router.delete("/:id", authMiddleware, deleteEmployee);

export default router;
