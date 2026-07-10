import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";

export const getDashboard = async (req, res) => {
  try {
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
      Employee.countDocuments(),
      Department.countDocuments(),
      Salary.countDocuments(),
      Leave.countDocuments(),
      Leave.countDocuments({ status: "Approved" }),
      Leave.countDocuments({ status: "Pending" }),
      Leave.countDocuments({ status: "Rejected" }),

      Salary.aggregate([
        {
          $group: {
            _id: null,
            totalSalaryPaid: {
              $sum: "$netSalary", // Change if your field name is different
            },
          },
        },
      ]),
    ]);

    const totalSalaryPaid =
      salaryResult.length > 0 ? salaryResult[0].totalSalaryPaid : 0;

    res.status(200).json({
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
  } catch (err) {
    console.error("Dashboard Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: err.message,
    });
  }
};