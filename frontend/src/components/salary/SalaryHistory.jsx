import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const SalaryHistory = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState({});
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalaryHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/salary/history/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          setSalaryHistory(response.data.salaries);

          if (response.data.salaries.length > 0) {
            setEmployee(response.data.salaries[0]);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Salary History
          </h2>

          <Link
            to="/admin-dashboard/employees"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Back
          </Link>
        </div>

        {/* Employee Details */}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-teal-600">
            Employee Information
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div>
              <p className="text-gray-500 text-sm">Employee ID</p>
              <p className="font-semibold">{employee.employeeCode}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Employee Name</p>
              <p className="font-semibold">{employee.employeeName}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Department</p>
              <p className="font-semibold">{employee.department}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Salary Records</p>
              <p className="font-semibold">{salaryHistory.length}</p>
            </div>

          </div>
        </div>

        {/* Salary Table */}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">

          <table className="w-full">

            <thead className="bg-teal-600 text-white">

              <tr>
                <th className="py-3 px-4">S.No</th>
                <th className="py-3 px-4">Basic Salary</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Pay Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>

            </thead>

            <tbody>

              {salaryHistory.length > 0 ? (
                salaryHistory.map((salary, index) => (
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
    salary.status === "Paid"
      ? "bg-green-600"
      : "bg-yellow-500"
  }`}
>
  {salary.status}
</span>
                      
                    </td>

                  </tr>
                ))
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