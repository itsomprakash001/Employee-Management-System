import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";

import { canManageRole } from "../utils/roleHierarchy.js";

export const getDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const actorRole = req.user.role;
    const actorUserId = req.user._id;

    

    const companyUsers = await User.find({
      companyId,
    }).select("_id role");

    const accessibleUserIds = companyUsers
      .filter((user) => {
        // User can always see their own dashboard data
        if (
          user._id.toString() ===
          actorUserId.toString()
        ) {
          return true;
        }

        // Other users must be lower in hierarchy
        return canManageRole(
          actorRole,
          user.role
        );
      })
      .map((user) => user._id);

    

    const accessibleEmployees =
      await Employee.find({
        companyId,
        userId: {
          $in: accessibleUserIds,
        },
      }).select("_id");

    const accessibleEmployeeIds =
      accessibleEmployees.map(
        (employee) => employee._id
      );

    

    const [
      totalEmployees,
      totalDepartments,
      totalSalaryRecords,
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves,
      salaryResult,
    ] = await Promise.all([
      // Employees accessible according to hierarchy
      Employee.countDocuments({
        companyId,
        userId: {
          $in: accessibleUserIds,
        },
      }),

      // Departments remain company-wide
      Department.countDocuments({
        companyId,
      }),

      // Salary records for accessible employees
      Salary.countDocuments({
        companyId,
        employeeId: {
          $in: accessibleEmployeeIds,
        },
      }),

      // Leaves for accessible employees
      Leave.countDocuments({
        companyId,
        employeeId: {
          $in: accessibleEmployeeIds,
        },
      }),

      // Approved leaves
      Leave.countDocuments({
        companyId,
        employeeId: {
          $in: accessibleEmployeeIds,
        },
        status: "Approved",
      }),

      // Pending leaves
      Leave.countDocuments({
        companyId,
        employeeId: {
          $in: accessibleEmployeeIds,
        },
        status: "Pending",
      }),

      // Rejected leaves
      Leave.countDocuments({
        companyId,
        employeeId: {
          $in: accessibleEmployeeIds,
        },
        status: "Rejected",
      }),

      // Total salary paid/recorded for accessible employees
      Salary.aggregate([
        {
          $match: {
            companyId,
            employeeId: {
              $in: accessibleEmployeeIds,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSalaryPaid: {
              $sum: "$netSalary",
            },
          },
        },
      ]),
    ]);

    const totalSalaryPaid =
      salaryResult.length > 0
        ? salaryResult[0].totalSalaryPaid
        : 0;

    return res.status(200).json({
      success: true,

      dashboard: {
        totalEmployees,
        totalDepartments,
        totalSalaryRecords,
        totalLeaves,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        totalSalaryPaid,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
    });
  }
};