import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";
import { clerkClient } from "@clerk/express";

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      companyId: req.user.companyId,
    }).sort({
      dep_name: 1,
    });

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.log("GET DEPARTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Get department server error",
    });
  }
};

const addDepartment = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Only the company head or manager can manage departments",
      });
    }

    const { dep_name, description } = req.body;

    if (!dep_name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Department name is required",
      });
    }

    const departmentName = dep_name.trim();

    const existingDepartment = await Department.findOne({
      companyId: req.user.companyId,
      dep_name: departmentName,
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        error: "Department already exists",
      });
    }

    const newDepartment = new Department({
      dep_name: departmentName,
      description: description?.trim() || "",
      companyId: req.user.companyId,
    });

    await newDepartment.save();

    return res.status(201).json({
      success: true,
      department: newDepartment,
    });
  } catch (error) {
    console.log("ADD DEPARTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Add department server error",
    });
  }
};

const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findOne({
      _id: id,
      companyId: req.user.companyId,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    console.log("GET DEPARTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Get department server error",
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Only the company head or manager can manage departments",
      });
    }

    const { id } = req.params;
    const { dep_name, description } = req.body;

    if (!dep_name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Department name is required",
      });
    }

    const departmentName = dep_name.trim();

    const duplicateDepartment = await Department.findOne({
      companyId: req.user.companyId,
      dep_name: departmentName,
      _id: {
        $ne: id,
      },
    });

    if (duplicateDepartment) {
      return res.status(400).json({
        success: false,
        error: "Department already exists",
      });
    }

    const department = await Department.findOneAndUpdate(
      {
        _id: id,
        companyId: req.user.companyId,
      },
      {
        dep_name: departmentName,
        description: description?.trim() || "",
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    console.log("UPDATE DEPARTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Edit department server error",
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Only the company head or manager can manage departments",
      });
    }

    const { id } = req.params;

    const department = await Department.findOne({
      _id: id,
      companyId: req.user.companyId,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    const employees = await Employee.find({
      department: id,
      companyId: req.user.companyId,
    });

    for (const employee of employees) {
      await Salary.deleteMany({
        employeeId: employee._id,
        companyId: req.user.companyId,
      });

      await Leave.deleteMany({
        employeeId: employee._id,
        companyId: req.user.companyId,
      });

      const employeeUser = await User.findOne({
        _id: employee.userId,
        companyId: req.user.companyId,
      });

      if (
        employeeUser?.clerkUserId &&
        employeeUser.clerkUserCreatedByEMS === true
      ) {
        try {
          await clerkClient.users.deleteUser(
            employeeUser.clerkUserId
          );

          console.log(
            "CLERK USER DELETED:",
            employeeUser.clerkUserId
          );
        } catch (clerkError) {
          console.log(
            "DELETE CLERK USER ERROR:",
            clerkError
          );
        }
      }

      await User.findOneAndDelete({
        _id: employee.userId,
        companyId: req.user.companyId,
      });

      await Employee.deleteOne({
        _id: employee._id,
        companyId: req.user.companyId,
      });
    }

    await Department.deleteOne({
      _id: id,
      companyId: req.user.companyId,
    });

    return res.status(200).json({
      success: true,
      message: "Department and all related records deleted successfully",
    });
  } catch (error) {
    console.log("DELETE DEPARTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Delete department server error",
    });
  }
};

export {
  addDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};