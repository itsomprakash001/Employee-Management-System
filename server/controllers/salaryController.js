import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

// ================= ADD SALARY =================
export const addSalary = async (req, res) => {
  try {
    const {
      employeeId,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      payDate,
      status,
    } = req.body;

    const salary = new Salary({
      employeeId,
      basicSalary: Number(basicSalary),
      allowances: Number(allowances),
      deductions: Number(deductions),
      netSalary: Number(netSalary),
      payDate,
      status,
    });

    await salary.save();

    return res.status(201).json({
      success: true,
      message: "Salary added successfully",
      salary,
    });
  } catch (error) {
    console.log("ADD SALARY ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while adding salary",
    });
  }
};

// ================= GET ALL SALARIES =================
export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate({
      path: "employeeId",
      populate: [
        { path: "userId" },
        { path: "department" },
      ],
    });

    const formatted = salaries.map((salary) => ({
      _id: salary._id,
      employeeId: salary.employeeId?.employeeId,
      employeeName: salary.employeeId?.userId?.name || "N/A",
      department: salary.employeeId?.department?.dep_name || "Not Assigned",
      basicSalary: salary.basicSalary,
      allowances: salary.allowances,
      deductions: salary.deductions,
      netSalary: salary.netSalary,
      payDate: salary.payDate
        ? new Date(salary.payDate).toLocaleDateString("en-GB")
        : "",
      status: salary.status,
    }));

    return res.status(200).json({
      success: true,
      salaries: formatted,
    });
  } catch (error) {
    console.log("GET SALARIES ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Get salaries server error",
    });
  }
};

// ================= GET SINGLE SALARY =================
export const getSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id).populate({
      path: "employeeId",
      populate: [
        { path: "userId" },
        { path: "department" },
      ],
    });

    if (!salary) {
      return res.status(404).json({
        success: false,
        error: "Salary not found",
      });
    }

    return res.status(200).json({
      success: true,
      salary,
    });
  } catch (error) {
    console.log("GET SALARY ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Get salary server error",
    });
  }
};

// ================= UPDATE SALARY =================
export const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary not found"
      });
    }

    // Check if salary already paid
    if (salary.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Salary is already paid. Cannot update."
      });
    }

    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      salary: updatedSalary,
      message: "Salary updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= DELETE SALARY =================
export const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findByIdAndDelete(id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        error: "Salary not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salary deleted successfully",
    });
  } catch (error) {
    console.log("DELETE SALARY ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Delete salary server error",
    });
  }
};

// ================= GET SALARY HISTORY =================
export const getSalaryHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const salaries = await Salary.find({ employeeId: id }).populate({
      path: "employeeId",
      populate: [
        { path: "userId" },
        { path: "department" },
      ],
    });

    const formatted = salaries.map((salary) => ({
      _id: salary._id,
      employeeId: salary.employeeId?._id,
      employeeCode: salary.employeeId?.employeeId,
      employeeName: salary.employeeId?.userId?.name || "N/A",
      department: salary.employeeId?.department?.dep_name || "Not Assigned",
      basicSalary: salary.basicSalary,
      allowances: salary.allowances,
      deductions: salary.deductions,
      netSalary: salary.netSalary,
      payDate: salary.payDate
        ? new Date(salary.payDate).toLocaleDateString("en-GB")
        : "",
      status: salary.status,
    }));

    return res.status(200).json({
      success: true,
      salaries: formatted,
    });
  } catch (error) {
    console.log("GET SALARY HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ================= GET LOGGED-IN EMPLOYEE SALARY =================

export const getMySalary = async (req, res) => {
  try {
    // Find employee using logged-in user's id
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Fetch all salary records of that employee
    const salaries = await Salary.find({
      employeeId: employee._id,
    })
      .populate({
        path: "employeeId",
        populate: [
          { path: "userId" },
          { path: "department" },
        ],
      })
      .sort({ payDate: -1 });

    return res.status(200).json({
      success: true,
      salaries,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};