import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    dep_name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

departmentSchema.index(
  { companyId: 1, dep_name: 1 },
  { unique: true }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;