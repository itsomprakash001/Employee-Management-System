import { getAuth } from "@clerk/express";
import User from "../models/User.js";

const verifyUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const user = await User.findOne({
      clerkUserId: userId,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "EMS user account not registered",
        code: "EMS_USER_NOT_FOUND",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("CLERK AUTH MIDDLEWARE ERROR:", error);

    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

export default verifyUser;