import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const SalaryManagement = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/salary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setSalaries(response.data.salaries || []);
        }
      } catch (error) {
        console.log(
          "FETCH SALARY ERROR:",
          error.response?.status,
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (getToken) {
      fetchSalaries();
    }
  }, [getToken]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-700">
          Salary Management
        </h2>

        <button
          type="button"
          onClick={() =>
            navigate("/admin-dashboard/salary/add")
          }
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md transition cursor-pointer"
        >
          Add Salary
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading salary records...
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Basic Salary</th>
                <th className="p-3">Allowances</th>
                <th className="p-3">Deductions</th>
                <th className="p-3">Net Salary</th>
                <th className="p-3">Pay Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <tr
                    key={salary._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">
                      {salary.employeeId || "N/A"}
                    </td>

                    <td className="p-3">
                      {salary.employeeName || "N/A"}
                    </td>

                    <td className="p-3">
                      {salary.department || "N/A"}
                    </td>

                    <td className="p-3">
                      ₹
                      {Number(
                        salary.basicSalary || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-3">
                      ₹
                      {Number(
                        salary.allowances || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-3">
                      ₹
                      {Number(
                        salary.deductions || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-3 font-semibold">
                      ₹
                      {Number(
                        salary.netSalary || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-3">
                      {salary.payDate || "N/A"}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          salary.status === "Paid"
                            ? "text-green-600 font-semibold"
                            : "text-yellow-600 font-semibold"
                        }
                      >
                        {salary.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center p-5 text-gray-500"
                  >
                    No Salary Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalaryManagement;