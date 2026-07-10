import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  login,
  verify,
  setting,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);

router.get("/verify", authMiddleware, verify);

router.put("/setting", authMiddleware, setting);

export default router;