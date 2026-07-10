import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";

// ================= APPLY LEAVE =================
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    const employee = await Employee.findOne({ userId: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        error: "From Date cannot be greater than To Date",
      });
    }

    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employeeId: employee._id,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
      status: "Pending",
    });

    await leave.save();

    return res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    console.log("APPLY LEAVE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ================= GET ALL LEAVES (ADMIN) =================
export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: "employeeId",
        populate: [
          {
            path: "userId",
            select: "name email",
          },
          {
            path: "department",
            select: "dep_name",
          },
        ],
      })
      .sort({ createdAt: -1 });

    const formattedLeaves = leaves.map((leave) => ({
      _id: leave._id,
      employeeName: leave.employeeId?.userId?.name || "N/A",
      employeeCode: leave.employeeId?.employeeId || "N/A",
      department: leave.employeeId?.department?.dep_name || "N/A",
      leaveType: leave.leaveType,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      totalDays: leave.totalDays,
      reason: leave.reason,
      status: leave.status,
    }));

    return res.status(200).json({
      success: true,
      leaves: formattedLeaves,
    });
  } catch (error) {
    console.log("GET LEAVES ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ================= GET MY LEAVES =================
export const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const leaves = await Leave.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.log("GET MY LEAVES ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ================= GET LEAVES OF PARTICULAR EMPLOYEE (ADMIN) =================
export const getEmployeeLeaves = async (req, res) => {
  try {
    const { id } = req.params; // Employee _id

    const employee = await Employee.findById(id).populate([
      {
        path: "userId",
        select: "name email",
      },
      {
        path: "department",
        select: "dep_name",
      },
    ]);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const leaves = await Leave.find({
      employeeId: id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      employee: {
        name: employee.userId?.name,
        email: employee.userId?.email,
        department: employee.department?.dep_name,
        employeeCode: employee.employeeId,
      },
      leaves,
    });
  } catch (error) {
    console.log("GET EMPLOYEE LEAVES ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ================= GET SINGLE LEAVE =================
export const getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found",
      });
    }

    return res.status(200).json({
      success: true,
      leave,
    });
  } catch (error) {
    console.log("GET LEAVE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ================= UPDATE LEAVE =================
export const updateLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        error: "Only Pending leave can be edited",
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        error: "From Date cannot be greater than To Date",
      });
    }

    leave.leaveType = leaveType;
    leave.fromDate = fromDate;
    leave.toDate = toDate;
    leave.reason = reason;
    leave.totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      leave,
    });
  } catch (error) {
    console.log("UPDATE LEAVE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// ================= APPROVE / REJECT LEAVE =================
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Status",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found",
      });
    }

    leave.status = status;

    await leave.save();

    return res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
    });
  } catch (error) {
    console.log("UPDATE LEAVE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};


export const deleteLeave = async (req, res) => {

  try {

    const { id } = req.params;



    const leave = await Leave.findByIdAndDelete(id);



    if (!leave) {

      return res.status(404).json({

        success: false,

        error: "Leave not found",

      });

    }



    return res.status(200).json({

      success: true,

      message: "Leave deleted successfully",

    });

  } catch (error) {

    console.log("DELETE LEAVE ERROR:", error);



    return res.status(500).json({

      success: false,

      error: "Server Error",

    });

  }

};        