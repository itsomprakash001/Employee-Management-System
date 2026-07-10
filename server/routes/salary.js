import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addSalary,
  getSalaries,
  getSalary,
  updateSalary,
  deleteSalary,
  getSalaryHistory,
  getMySalary,
} from "../controllers/salaryController.js";

const router = express.Router();

// Admin
router.post("/add", authMiddleware, addSalary);
router.get("/", authMiddleware, getSalaries);
router.get("/history/:id", authMiddleware, getSalaryHistory);

// Employee
router.get("/my-salary", authMiddleware, getMySalary);

// Common
router.get("/:id", authMiddleware, getSalary);
router.put("/:id", authMiddleware, updateSalary);
router.delete("/:id", authMiddleware, deleteSalary);

export default router;