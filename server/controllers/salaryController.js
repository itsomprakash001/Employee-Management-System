import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

import {
  canManageRole,
} from "../utils/roleHierarchy.js";



const canManageSalaryEmployee = async (
  req,
  employeeId
) => {
  const employee =
    await Employee.findOne({
      _id: employeeId,
      companyId: req.user.companyId,
    }).populate("userId");

  if (!employee) {
    return {
      allowed: false,
      employee: null,
      error:
        "Employee not found in your company",
    };
  }

  // Employee cannot manage their own salary
  if (
    employee.userId?._id?.toString() ===
    req.user._id.toString()
  ) {
    return {
      allowed: false,
      employee,
      error:
        "You cannot manage your own salary",
    };
  }

  const targetRole =
    employee.userId?.role;

  if (!targetRole) {
    return {
      allowed: false,
      employee,
      error:
        "Employee role not found",
    };
  }

  return {
    allowed: canManageRole(
      req.user.role,
      targetRole
    ),
    employee,
    error:
      "You are not allowed to manage this employee's salary",
  };
};



export const addSalary = async (
  req,
  res
) => {
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

    const access =
      await canManageSalaryEmployee(
        req,
        employeeId
      );

    if (!access.employee) {
      return res.status(404).json({
        success: false,
        error: access.error,
      });
    }

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        error: access.error,
      });
    }

    const salary =
      new Salary({
        employeeId,

        companyId:
          req.user.companyId,

        basicSalary:
          Number(basicSalary),

        allowances:
          Number(
            allowances || 0
          ),

        deductions:
          Number(
            deductions || 0
          ),

        netSalary:
          Number(netSalary),

        payDate,

        status,
      });

    await salary.save();

    return res.status(201).json({
      success: true,
      message:
        "Salary added successfully",
      salary,
    });
  } catch (error) {
    console.log(
      "ADD SALARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Server error while adding salary",
    });
  }
};



export const getSalaries = async (
  req,
  res
) => {
  try {
    const salaries =
      await Salary.find({
        companyId:
          req.user.companyId,
      }).populate({
        path: "employeeId",

        populate: [
          {
            path: "userId",
          },
          {
            path: "department",
          },
        ],
      });

    

    const accessibleSalaries =
      salaries.filter((salary) => {
        const employee =
          salary.employeeId;

        const targetUser =
          employee?.userId;

        if (!targetUser) {
          return false;
        }

        // User can see own salary
        if (
          targetUser._id.toString() ===
          req.user._id.toString()
        ) {
          return true;
        }

        // Higher roles can see lower roles
        return canManageRole(
          req.user.role,
          targetUser.role
        );
      });

    

    const formatted =
      accessibleSalaries.map(
        (salary) => ({
          _id: salary._id,

          employeeId:
            salary.employeeId
              ?.employeeId,

          employeeName:
            salary.employeeId
              ?.userId?.name ||
            "N/A",

          // Important for frontend hierarchy
          employeeRole:
            salary.employeeId
              ?.userId?.role ||
            "",

          department:
            salary.employeeId
              ?.department
              ?.dep_name ||
            "Not Assigned",

          basicSalary:
            salary.basicSalary,

          allowances:
            salary.allowances,

          deductions:
            salary.deductions,

          netSalary:
            salary.netSalary,

          payDate:
            salary.payDate
              ? new Date(
                  salary.payDate
                ).toLocaleDateString(
                  "en-GB"
                )
              : "",

          status:
            salary.status,
        })
      );

    return res.status(200).json({
      success: true,
      salaries: formatted,
    });
  } catch (error) {
    console.log(
      "GET SALARIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Get salaries server error",
    });
  }
};



export const getSalary = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const salary =
      await Salary.findOne({
        _id: id,

        companyId:
          req.user.companyId,
      }).populate({
        path: "employeeId",

        populate: [
          {
            path: "userId",
          },
          {
            path: "department",
          },
        ],
      });

    if (!salary) {
      return res.status(404).json({
        success: false,
        error:
          "Salary not found",
      });
    }

    const targetUser =
      salary.employeeId?.userId;

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error:
          "Salary employee not found",
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
          "You are not allowed to view this salary",
      });
    }

    return res.status(200).json({
      success: true,
      salary,
    });
  } catch (error) {
    console.log(
      "GET SALARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Get salary server error",
    });
  }
};



export const updateSalary = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const salary =
      await Salary.findOne({
        _id: id,

        companyId:
          req.user.companyId,
      }).populate({
        path: "employeeId",

        populate: {
          path: "userId",
        },
      });

    if (!salary) {
      return res.status(404).json({
        success: false,
        error:
          "Salary not found",
      });
    }

    const targetUser =
      salary.employeeId?.userId;

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error:
          "Salary employee not found",
      });
    }

    

    if (
      targetUser._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error:
          "You cannot update your own salary",
      });
    }

    

    if (
      !canManageRole(
        req.user.role,
        targetUser.role
      )
    ) {
      return res.status(403).json({
        success: false,
        error:
          "You are not allowed to update this salary",
      });
    }

    

    if (
      salary.status === "Paid"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Salary is already paid. Cannot update.",
      });
    }

    const {
      basicSalary,
      allowances,
      deductions,
      netSalary,
      payDate,
      status,
    } = req.body;

    salary.basicSalary =
      basicSalary !== undefined
        ? Number(basicSalary)
        : salary.basicSalary;

    salary.allowances =
      allowances !== undefined
        ? Number(allowances)
        : salary.allowances;

    salary.deductions =
      deductions !== undefined
        ? Number(deductions)
        : salary.deductions;

    salary.netSalary =
      netSalary !== undefined
        ? Number(netSalary)
        : salary.netSalary;

    salary.payDate =
      payDate ||
      salary.payDate;

    salary.status =
      status ||
      salary.status;

    await salary.save();

    return res.status(200).json({
      success: true,
      salary,

      message:
        "Salary updated successfully",
    });
  } catch (error) {
    console.log(
      "UPDATE SALARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Update salary server error",
    });
  }
};



export const deleteSalary = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const salary =
      await Salary.findOne({
        _id: id,

        companyId:
          req.user.companyId,
      }).populate({
        path: "employeeId",

        populate: {
          path: "userId",
        },
      });

    if (!salary) {
      return res.status(404).json({
        success: false,
        error:
          "Salary not found",
      });
    }

    const targetUser =
      salary.employeeId?.userId;

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error:
          "Salary employee not found",
      });
    }

    

    if (
      targetUser._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error:
          "You cannot delete your own salary",
      });
    }

    

    if (
      !canManageRole(
        req.user.role,
        targetUser.role
      )
    ) {
      return res.status(403).json({
        success: false,
        error:
          "You are not allowed to delete this salary",
      });
    }

    await Salary.deleteOne({
      _id: salary._id,

      companyId:
        req.user.companyId,
    });

    return res.status(200).json({
      success: true,
      message:
        "Salary deleted successfully",
    });
  } catch (error) {
    console.log(
      "DELETE SALARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Delete salary server error",
    });
  }
};



export const getSalaryHistory =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const employee =
        await Employee.findOne({
          _id: id,

          companyId:
            req.user.companyId,
        }).populate("userId");

      if (!employee) {
        return res.status(404).json({
          success: false,
          error:
            "Employee not found",
        });
      }

      const targetUser =
        employee.userId;

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error:
            "Employee user not found",
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
            "You are not allowed to view this salary history",
        });
      }

      const salaries =
        await Salary.find({
          employeeId:
            employee._id,

          companyId:
            req.user.companyId,
        })
          .populate({
            path: "employeeId",

            populate: [
              {
                path: "userId",
              },
              {
                path: "department",
              },
            ],
          })
          .sort({
            payDate: -1,
          });

      const formatted =
        salaries.map(
          (salary) => ({
            _id: salary._id,

            employeeId:
              salary.employeeId
                ?._id,

            employeeCode:
              salary.employeeId
                ?.employeeId,

            employeeName:
              salary.employeeId
                ?.userId?.name ||
              "N/A",

            employeeRole:
              salary.employeeId
                ?.userId?.role ||
              "",

            department:
              salary.employeeId
                ?.department
                ?.dep_name ||
              "Not Assigned",

            basicSalary:
              salary.basicSalary,

            allowances:
              salary.allowances,

            deductions:
              salary.deductions,

            netSalary:
              salary.netSalary,

            payDate:
              salary.payDate
                ? new Date(
                    salary.payDate
                  ).toLocaleDateString(
                    "en-GB"
                  )
                : "",

            status:
              salary.status,
          })
        );

      return res.status(200).json({
        success: true,
        salaries: formatted,
      });
    } catch (error) {
      console.log(
        "GET SALARY HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Server Error",
      });
    }
  };



export const getMySalary = async (
  req,
  res
) => {
  try {
    const employee =
      await Employee.findOne({
        userId: req.user._id,

        companyId:
          req.user.companyId,
      });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error:
          "Employee not found",
      });
    }

    const salaries =
      await Salary.find({
        employeeId:
          employee._id,

        companyId:
          req.user.companyId,
      })
        .populate({
          path: "employeeId",

          populate: [
            {
              path: "userId",
            },
            {
              path: "department",
            },
          ],
        })
        .sort({
          payDate: -1,
        });

    return res.status(200).json({
      success: true,
      salaries,
    });
  } catch (error) {
    console.log(
      "GET MY SALARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Server Error",
    });
  }
};