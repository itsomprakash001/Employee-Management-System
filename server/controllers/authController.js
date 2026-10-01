import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getAuth } from "@clerk/express";

import User from "../models/User.js";
import Company from "../models/Company.js";


const register = async (req, res) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        error: "Clerk authentication required",
      });
    }

    const {
      name,
      dob,
      username,
      email,
      companyName,
    } = req.body;

    
    if (
      !name ||
      !dob ||
      !username ||
      !email ||
      !companyName
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    
    const clerkUserExists = await User.findOne({
      clerkUserId,
    });

    if (clerkUserExists) {
      return res.status(400).json({
        success: false,
        error: "This Clerk account is already registered",
      });
    }

    
    const normalizedUsername =
      username.trim();

    const usernameExists = await User.findOne({
      username: normalizedUsername,
    });

    if (usernameExists) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    
    const normalizedEmail =
      email.trim().toLowerCase();

    const emailExists = await User.findOne({
      email: normalizedEmail,
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    
    const normalizedCompanyName =
      companyName.trim();

    const companyExists = await Company.findOne({
      name: normalizedCompanyName,
    });

    if (companyExists) {
      return res.status(400).json({
        success: false,
        error: "Company name already exists",
      });
    }

    
    const companyId =
      new mongoose.Types.ObjectId();

    session.startTransaction();
    transactionStarted = true;

    
    const newUser = new User({
      clerkUserId,

      name: name.trim(),

      dob,

      username: normalizedUsername,

      email: normalizedEmail,

      // Clerk handles authentication
      password: undefined,

      
      role: "admin",

      designation: "CEO / Company Owner",

      companyId,
    });

    const savedUser =
      await newUser.save({
        session,
      });

    
    const newCompany = new Company({
      _id: companyId,

      name: normalizedCompanyName,

      head: savedUser._id,
    });

    await newCompany.save({
      session,
    });

    
    await session.commitTransaction();
    transactionStarted = false;

    return res.status(201).json({
      success: true,

      message:
        "Company account created successfully",

      user: {
        _id: savedUser._id,

        clerkUserId:
          savedUser.clerkUserId,

        name: savedUser.name,

        username:
          savedUser.username,

        email:
          savedUser.email,

        dob: savedUser.dob,

        designation:
          savedUser.designation,

        role:
          savedUser.role,

        companyId:
          savedUser.companyId,

        profileImage:
          savedUser.profileImage || "",
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }

    console.log(
      "REGISTER ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error:
          "Username, email, or company name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  } finally {
    await session.endSession();
  }
};

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User Not Found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        error:
          "This account uses Clerk authentication",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Wrong Password",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "10d",
      }
    );

    return res.status(200).json({
      success: true,

      token,

      user: {
        _id: user._id,

        name: user.name,

        username:
          user.username,

        email:
          user.email,

        dob:
          user.dob,

        designation:
          user.designation,

        role:
          user.role,

        companyId:
          user.companyId,

        profileImage:
          user.profileImage || "",
      },
    });
  } catch (error) {
    console.log(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};



const verify = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};



const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const newEmail =
      email.trim().toLowerCase();

    
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    
    if (user.email === newEmail) {
      return res.status(400).json({
        success: false,
        error:
          "This is already your current email",
      });
    }

    
    const existingUser =
      await User.findOne({
        email: newEmail,
        _id: {
          $ne: user._id,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error:
          "This email is already registered",
      });
    }

    
    user.email = newEmail;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,

      message:
        "Email updated successfully",

      user: {
        _id: user._id,

        clerkUserId:
          user.clerkUserId,

        name:
          user.name,

        username:
          user.username,

        email:
          user.email,

        dob:
          user.dob,

        designation:
          user.designation,

        role:
          user.role,

        companyId:
          user.companyId,

        profileImage:
          user.profileImage || "",
      },
    });
  } catch (error) {
    console.log(
      "UPDATE EMAIL ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error:
          "This email is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      error:
        "Failed to update email",
    });
  }
};



const setting = async (req, res) => {
  try {
    const {
      oldPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        error:
          "New Password and Confirm Password do not match",
      });
    }

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        error:
          "Password is managed by Clerk",
      });
    }

    const isMatch =
      await bcrypt.compare(
        oldPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error:
          "Old Password is incorrect",
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(
        newPassword,
        salt
      );

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.log(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};


export {
  register,
  login,
  verify,
  updateEmail,
  setting,
};