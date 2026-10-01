import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const SalaryHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();

  const [employee, setEmployee] = useState({});
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchSalaryHistory = async () => {
      try {
        setLoading(true);

        const token = await getToken();

        if (!token) {
          alert(
            "Authentication token not found. Please login again."
          );
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/salary/history/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const salaries =
            response.data.salaries || [];

          setSalaryHistory(salaries);

          if (salaries.length > 0) {
            setEmployee(salaries[0]);
          }
        }
      } catch (error) {
        console.log(
          "FETCH SALARY HISTORY ERROR:",
          error.response?.status,
          error.response?.data ||
            error.message
        );

        if (
          error.response?.status === 403 ||
          error.response?.status === 404
        ) {
          setAccessDenied(true);
        } else {
          alert(
            error.response?.data?.error ||
              "Failed to fetch salary history"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && user && getToken) {
      fetchSalaryHistory();
    }
  }, [id, user, getToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-lg font-semibold text-gray-600">
          Loading salary history...
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600 mb-5">
            You are not allowed to view this salary history.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin-dashboard/salary")
            }
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg"
          >
            Back to Salary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Salary History
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/admin-dashboard/salary")
            }
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* Employee Details */}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-teal-600">
            Employee Information
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-gray-500 text-sm">
                Employee ID
              </p>

              <p className="font-semibold">
                {employee.employeeCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Employee Name
              </p>

              <p className="font-semibold">
                {employee.employeeName || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Role
              </p>

              <p className="font-semibold capitalize">
                {employee.employeeRole || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Department
              </p>

              <p className="font-semibold">
                {employee.department || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Salary Records
              </p>

              <p className="font-semibold">
                {salaryHistory.length}
              </p>
            </div>
          </div>
        </div>

        {/* Salary Table */}

        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="py-3 px-4">
                  S.No
                </th>

                <th className="py-3 px-4">
                  Basic Salary
                </th>

                <th className="py-3 px-4">
                  Allowances
                </th>

                <th className="py-3 px-4">
                  Deductions
                </th>

                <th className="py-3 px-4">
                  Net Salary
                </th>

                <th className="py-3 px-4">
                  Pay Date
                </th>

                <th className="py-3 px-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {salaryHistory.length > 0 ? (
                salaryHistory.map(
                  (salary, index) => (
                    <tr
                      key={salary._id}
                      className="border-b hover:bg-gray-100 transition"
                    >
                      <td className="text-center py-3">
                        {index + 1}
                      </td>

                      <td className="text-center">
                        ₹ {salary.basicSalary}
                      </td>

                      <td className="text-center">
                        ₹ {salary.allowances}
                      </td>

                      <td className="text-center">
                        ₹ {salary.deductions}
                      </td>

                      <td className="text-center font-semibold text-green-600">
                        ₹ {salary.netSalary}
                      </td>

                      <td className="text-center">
                        {salary.payDate}
                      </td>

                      <td className="text-center">
                        <span
                          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold text-white ${
                            salary.status ===
                            "Paid"
                              ? "bg-green-600"
                              : "bg-yellow-500"
                          }`}
                        >
                          {salary.status}
                        </span>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-8 text-gray-500"
                  >
                    No Salary Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryHistory;