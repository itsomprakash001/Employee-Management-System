import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  
  clerkUserId: {
    type: String,
    unique: true,
    sparse: true,
  },

  
  clerkUserCreatedByEMS: {
    type: Boolean,
    default: false,
  },

  
  name: {
    type: String,
    required: true,
    trim: true,
  },

  
  dob: {
    type: Date,
    required: true,
  },

  
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  
  password: {
    type: String,
    required: false,
  },

  
  role: {
    type: String,
    enum: [
      "admin",
      "manager",
      "hr",
      "tl",
      "employee",
    ],
    required: true,
  },

  
  designation: {
    type: String,
    required: true,
    trim: true,
  },

  
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  
  profileImage: {
    type: String,
  },

  
  profileImagePublicId: {
    type: String,
  },

  
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

const User = mongoose.model("User", userSchema);

export default User;