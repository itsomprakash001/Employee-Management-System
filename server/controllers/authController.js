import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User Not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

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
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};


// ================= VERIFY =================
const verify = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};


// ================= CHANGE PASSWORD =================
const setting = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;


    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }


    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "New Password and Confirm Password do not match",
      });
    }


    const user = await User.findById(req.user._id);


    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }


    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );


    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Old Password is incorrect",
      });
    }


    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );


    await user.save();


    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });

  }
};


export { login, verify, setting };