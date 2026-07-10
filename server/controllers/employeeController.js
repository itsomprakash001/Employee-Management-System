import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

// ================= ADD EMPLOYEE =================
export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      profileImage: req.file ? req.file.filename : "",
    });

    const savedUser = await newUser.save();

    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary: Number(salary),
    });

    await newEmployee.save();

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
    });
  } catch (error) {
    console.log("ADD EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while adding employee",
    });
  }
};

// ================= GET ALL EMPLOYEES =================
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId")
      .populate("department");

    const formatted = employees.map((emp) => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      name: emp.userId?.name || "N/A",
      email: emp.userId?.email || "N/A",
      profileImage: emp.userId?.profileImage || "",
      dep_name: emp.department?.dep_name || "Not Assigned",
      dob: emp.dob ? new Date(emp.dob).toDateString() : "",
      gender: emp.gender,
      maritalStatus: emp.maritalStatus,
      designation: emp.designation,
      salary: emp.salary,
      role: emp.userId?.role || "",
    }));

    return res.status(200).json({
      success: true,
      employees: formatted,
    });
  } catch (error) {
    console.log("GET EMPLOYEES ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Get employees server error",
    });
  }
};

// ================= GET SINGLE EMPLOYEE =================
export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate("userId")
      .populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.log("GET EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Get employee server error",
    });
  }
};

// ================= UPDATE EMPLOYEE =================
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      role,
    } = req.body;

    const employee = await Employee.findById(id).populate("userId");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    

    // Update Employee collection
    employee.employeeId = employeeId;
    employee.dob = dob;
    employee.gender = gender;
    employee.maritalStatus = maritalStatus;
    employee.designation = designation;
    employee.department = department;
    employee.salary = Number(salary);

    await employee.save();

    // Update User collection
    await User.findByIdAndUpdate(employee.userId._id, {
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.log("UPDATE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Update employee server error",
    });
  }
};

// ================= DELETE EMPLOYEE =================
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

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

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.log("DELETE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Delete employee server error",
    });
  }
};



// ================= GET LOGGED IN EMPLOYEE PROFILE =================
export const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id })
      .populate("userId")
      .populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      employee: {
        name: employee.userId.name,
        email: employee.userId.email,
        profileImage: employee.userId.profileImage,
        employeeId: employee.employeeId,
        department: employee.department?.dep_name,
        designation: employee.designation,
        gender: employee.gender,
        dob: employee.dob,
        maritalStatus: employee.maritalStatus,
        salary: employee.salary,
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