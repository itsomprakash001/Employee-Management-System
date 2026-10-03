import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import { canManageRole } from "../utils/roleHierarchy.js";

const getEmployeeWithRole = async (employeeId, companyId) => {
  return await Employee.findOne({
    _id: employeeId,
    companyId,
  }).populate("userId");
};

const canManageEmployeeLeave = async (req, employeeId) => {
  const employee = await getEmployeeWithRole(
    employeeId,
    req.user.companyId
  );

  if (!employee) {
    return {
      allowed: false,
      employee: null,
      error: "Employee not found in your company",
    };
  }

  const targetUser = employee.userId;

  if (!targetUser) {
    return {
      allowed: false,
      employee,
      error: "Employee user not found",
    };
  }

  if (
    targetUser._id.toString() ===
    req.user._id.toString()
  ) {
    return {
      allowed: false,
      employee,
      isSelf: true,
      error: "You cannot manage your own leave",
    };
  }

  const allowed = canManageRole(
    req.user.role,
    targetUser.role
  );

  return {
    allowed,
    employee,
    isSelf: false,
    error:
      "You are not allowed to manage this employee's leave",
  };
};

const calculateTotalDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (
    isNaN(start.getTime()) ||
    isNaN(end.getTime())
  ) {
    return {
      valid: false,
      error: "Invalid leave dates",
    };
  }

  if (start > end) {
    return {
      valid: false,
      error: "From Date cannot be greater than To Date",
    };
  }

  const totalDays =
    Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    valid: true,
    totalDays,
  };
};

export const applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      fromDate,
      toDate,
      reason,
    } = req.body;

    const allowedRoles = [
      "manager",
      "hr",
      "tl",
      "employee",
    ];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "You are not allowed to apply for leave",
      });
    }

    const validLeaveTypes = [
      "Casual Leave",
      "Sick Leave",
      "Annual Leave",
      "Emergency Leave",
    ];

    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid leave type",
      });
    }

    if (
      !fromDate ||
      !toDate ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "All leave fields are required",
      });
    }

    const employee = await Employee.findOne({
      userId: req.user._id,
      companyId: req.user.companyId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee record not found for your account",
      });
    }

    const dateResult = calculateTotalDays(
      fromDate,
      toDate
    );

    if (!dateResult.valid) {
      return res.status(400).json({
        success: false,
        error: dateResult.error,
      });
    }

    const leave = new Leave({
      employeeId: employee._id,
      companyId: req.user.companyId,
      leaveType,
      fromDate,
      toDate,
      totalDays: dateResult.totalDays,
      reason: reason.trim(),
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

export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      companyId: req.user.companyId,
    })
      .populate({
        path: "employeeId",
        populate: [
          {
            path: "userId",
            select: "name email role",
          },
          {
            path: "department",
            select: "dep_name",
          },
        ],
      })
      .sort({
        createdAt: -1,
      });

    const accessibleLeaves = leaves.filter((leave) => {
      const targetUser = leave.employeeId?.userId;

      if (!targetUser) {
        return false;
      }

      if (
        targetUser._id.toString() ===
        req.user._id.toString()
      ) {
        return true;
      }

      return canManageRole(
        req.user.role,
        targetUser.role
      );
    });

    const formattedLeaves = accessibleLeaves.map(
      (leave) => ({
        _id: leave._id,
        employeeName:
          leave.employeeId?.userId?.name || "N/A",
        employeeCode:
          leave.employeeId?.employeeId || "N/A",
        employeeRole:
          leave.employeeId?.userId?.role || "",
        department:
          leave.employeeId?.department?.dep_name ||
          "N/A",
        leaveType: leave.leaveType,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        totalDays: leave.totalDays,
        reason: leave.reason,
        status: leave.status,
      })
    );

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

export const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
      companyId: req.user.companyId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const leaves = await Leave.find({
      employeeId: employee._id,
      companyId: req.user.companyId,
    }).sort({
      createdAt: -1,
    });

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

export const getEmployeeLeaves = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      _id: id,
      companyId: req.user.companyId,
    }).populate([
      {
        path: "userId",
        select: "name email role",
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

    const targetUser = employee.userId;

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: "Employee user not found",
      });
    }

    const isSelf =
      targetUser._id.toString() ===
      req.user._id.toString();

    const canView =
      isSelf ||
      canManageRole(
        req.user.role,
        targetUser.role
      );

    if (!canView) {
      return res.status(403).json({
        success: false,
        error:
          "You are not allowed to view this employee's leaves",
      });
    }

    const leaves = await Leave.find({
      employeeId: id,
      companyId: req.user.companyId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      employee: {
        name: employee.userId?.name,
        email: employee.userId?.email,
        role: employee.userId?.role,
        department: employee.department?.dep_name,
        employeeCode: employee.employeeId,
      },
      leaves,
    });
  } catch (error) {
    console.log(
      "GET EMPLOYEE LEAVES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const getLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found",
      });
    }

    const employee = await getEmployeeWithRole(
      leave.employeeId,
      req.user.companyId
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const targetUser = employee.userId;

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: "Employee user not found",
      });
    }

    const isSelf =
      targetUser._id.toString() ===
      req.user._id.toString();

    const canView =
      isSelf ||
      canManageRole(
        req.user.role,
        targetUser.role
      );

    if (!canView) {
      return res.status(403).json({
        success: false,
        error:
          "You are not allowed to view this leave",
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

export const updateLeave = async (req, res) => {
  try {
    const {
      leaveType,
      fromDate,
      toDate,
      reason,
    } = req.body;

    const leave = await Leave.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found",
      });
    }

    if (
      !leaveType ||
      !fromDate ||
      !toDate ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "All leave fields are required",
      });
    }

    const validLeaveTypes = [
      "Casual Leave",
      "Sick Leave",
      "Annual Leave",
      "Emergency Leave",
    ];

    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid leave type",
      });
    }

    const access =
      await canManageEmployeeLeave(
        req,
        leave.employeeId
      );

    if (access.isSelf) {
      if (leave.status !== "Pending") {
        return res.status(400).json({
          success: false,
          error: "Only Pending leave can be edited",
        });
      }
    } else {
      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          error: access.error,
        });
      }

      if (leave.status !== "Pending") {
        return res.status(400).json({
          success: false,
          error: "Only Pending leave can be edited",
        });
      }
    }

    const dateResult = calculateTotalDays(
      fromDate,
      toDate
    );

    if (!dateResult.valid) {
      return res.status(400).json({
        success: false,
        error: dateResult.error,
      });
    }

    leave.leaveType = leaveType;
    leave.fromDate = fromDate;
    leave.toDate = toDate;
    leave.reason = reason.trim();
    leave.totalDays = dateResult.totalDays;

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

export const updateLeaveStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Status",
      });
    }

    const leave = await Leave.findOne({
      _id: id,
      companyId: req.user.companyId,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found",
      });
    }

    const access =
      await canManageEmployeeLeave(
        req,
        leave.employeeId
      );

    if (access.isSelf) {
      return res.status(403).json({
        success: false,
        error:
          "You cannot approve or reject your own leave",
      });
    }

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        error: access.error,
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        error:
          "Only Pending leave can be approved or rejected",
      });
    }

    leave.status = status;

    await leave.save();

    return res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      leave,
    });
  } catch (error) {
    console.log(
      "UPDATE LEAVE STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findOne({
      _id: id,
      companyId: req.user.companyId,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found",
      });
    }

    const access =
      await canManageEmployeeLeave(
        req,
        leave.employeeId
      );

    if (access.isSelf) {
      if (leave.status !== "Pending") {
        return res.status(400).json({
          success: false,
          error:
            "Only Pending leave can be deleted",
        });
      }
    } else {
      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          error: access.error,
        });
      }

      if (leave.status !== "Pending") {
        return res.status(400).json({
          success: false,
          error:
            "Only Pending leave can be deleted",
        });
      }
    }

    await Leave.deleteOne({
      _id: id,
      companyId: req.user.companyId,
    });

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