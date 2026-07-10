import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";

// ================= GET ALL DEPARTMENTS =================
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Get department server error",
    });
  }
};

// ================= ADD DEPARTMENT =================
const addDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;

    const newDepartment = new Department({
      dep_name,
      description,
    });

    await newDepartment.save();

    return res.status(201).json({
      success: true,
      department: newDepartment,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Add department server error",
    });
  }
};

// ================= GET SINGLE DEPARTMENT =================
const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

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
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Get department server error",
    });
  }
};

// ================= UPDATE DEPARTMENT =================
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { dep_name, description } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      {
        dep_name,
        description,
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
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Edit department server error",
    });
  }
};

// ================= DELETE DEPARTMENT (CASCADE DELETE) =================
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    // Find all employees in this department
    const employees = await Employee.find({ department: id });

    for (const employee of employees) {
      // Delete salary records
      await Salary.deleteMany({
        employeeId: employee._id,
      });

      // Delete leave records
      await Leave.deleteMany({
        employeeId: employee._id,
      });

      // Delete user account
      await User.findByIdAndDelete(employee.userId);

      // Delete employee
      await Employee.findByIdAndDelete(employee._id);
    }

    // Delete department
    await Department.findByIdAndDelete(id);

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