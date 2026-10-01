import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const roleHierarchy = {
  admin: 5,
  manager: 4,
  hr: 3,
  tl: 2,
  employee: 1,
};

const canManageRole = (actorRole, targetRole) => {
  const actorLevel = roleHierarchy[actorRole];
  const targetLevel = roleHierarchy[targetRole];

  if (
    actorLevel === undefined ||
    targetLevel === undefined
  ) {
    return false;
  }

  return actorLevel > targetLevel;
};

const List = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();

  const [salaries, setSalaries] = useState([]);
  const [search, setSearch] = useState("");

  

  const fetchSalaries = async () => {
    try {
      const token = await getToken();

      if (!token) {
        console.log("CLERK TOKEN NOT FOUND");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/salary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSalaries(
          response.data.salaries || []
        );
      }
    } catch (error) {
      console.log(
        "FETCH SALARY ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.error ||
          "Unable to fetch salary records"
      );
    }
  };

  useEffect(() => {
    if (getToken) {
      fetchSalaries();
    }
  }, [getToken]);

  

  const canManageSalary = (salary) => {
    if (!user || !salary) {
      return false;
    }

    // Employee cannot manage salary
    if (user.role === "employee") {
      return false;
    }

    const targetRole =
      salary.employeeRole;

    if (!targetRole) {
      return false;
    }

    return canManageRole(
      user.role,
      targetRole
    );
  };

  

  const filteredSalaries =
    salaries.filter((salary) => {
      const searchText =
        search.toLowerCase();

      return (
        salary.employeeId
          ?.toLowerCase()
          .includes(searchText) ||
        salary.employeeName
          ?.toLowerCase()
          .includes(searchText) ||
        salary.employeeRole
          ?.toLowerCase()
          .includes(searchText) ||
        salary.department
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  

  const canAddSalary =
    user &&
    [
      "admin",
      "manager",
      "hr",
      "tl",
    ].includes(user.role);

  return (
    <div className="max-w-6xl mx-auto p-4">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-2xl font-bold text-gray-800">
          Salary Management
        </h2>

        {canAddSalary && (
          <Link
            to="/admin-dashboard/salary/add"
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 cursor-pointer"
          >
            Add Salary
          </Link>
        )}

      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search employee, ID, role..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-80 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-teal-600 text-white">

            <tr>
              <th className="px-2 py-3">
                Employee ID
              </th>

              <th className="px-2 py-3">
                Employee Name
              </th>

              <th className="px-2 py-3">
                Role
              </th>

              <th className="px-2 py-3">
                Department
              </th>

              <th className="px-2 py-3">
                Basic Salary
              </th>

              <th className="px-2 py-3">
                Allowances
              </th>

              <th className="px-2 py-3">
                Deductions
              </th>

              <th className="px-2 py-3">
                Net Salary
              </th>

              <th className="px-2 py-3">
                Pay Date
              </th>

              <th className="px-2 py-3">
                Status
              </th>

              <th className="px-2 py-3">
                Action
              </th>
            </tr>

          </thead>

          <tbody>

            {filteredSalaries.length > 0 ? (

              filteredSalaries.map((salary) => {

                const canEdit =
                  canManageSalary(
                    salary
                  );

                return (
                  <tr
                    key={salary._id}
                    className="border-b hover:bg-gray-50 text-center transition"
                  >

                    <td className="px-2 py-3">
                      {salary.employeeId}
                    </td>

                    <td className="px-2 py-3">
                      {salary.employeeName ||
                        "N/A"}
                    </td>

                    <td className="px-2 py-3 capitalize">
                      {salary.employeeRole ||
                        "N/A"}
                    </td>

                    <td className="px-2 py-3">
                      {salary.department ||
                        "N/A"}
                    </td>

                    <td className="px-2 py-3 font-medium">
                      ₹{salary.basicSalary}
                    </td>

                    <td className="px-2 py-3">
                      ₹{salary.allowances}
                    </td>

                    <td className="px-2 py-3">
                      ₹{salary.deductions}
                    </td>

                    <td className="px-2 py-3 font-semibold text-teal-700">
                      ₹{salary.netSalary}
                    </td>

                    <td className="px-2 py-3">
                      {salary.payDate
                        ? new Date(
                            salary.payDate
                          ).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </td>

                    <td className="px-2 py-3">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          salary.status ===
                          "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {salary.status}
                      </span>

                    </td>

                    <td className="px-2 py-3">

                      {canEdit ? (

                        <button
                          onClick={() =>
                            navigate(
                              `/admin-dashboard/salary/edit/${salary._id}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition duration-300 hover:scale-105 cursor-pointer"
                        >
                          Edit
                        </button>

                      ) : (

                        <span className="text-gray-400 text-xs">
                          View only
                        </span>

                      )}

                    </td>

                  </tr>
                );
              })

            ) : (

              <tr>
                <td
                  colSpan="11"
                  className="py-6 text-center text-gray-500"
                >
                  No salary records found.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>
    </div>
  );
};

export default List;