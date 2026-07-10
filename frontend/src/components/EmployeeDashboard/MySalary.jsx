import React, { useEffect, useState } from "react";
import axios from "axios";

const MySalary = () => {
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    fetchSalary();
  }, []);

  const fetchSalary = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/salary/my-salary",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setSalaries(response.data.salaries);
      }
    } catch (error) {
      console.error("Error fetching salary:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700">
          My Salary History
        </h1>
        <p className="text-gray-500 mt-1">
          View your salary details and payment history.
        </p>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Basic Salary</th>
              <th className="px-6 py-4 text-left">Allowances</th>
              <th className="px-6 py-4 text-left">Deductions</th>
              <th className="px-6 py-4 text-left">Net Salary</th>
              <th className="px-6 py-4 text-left">Pay Date</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {salaries.length > 0 ? (
              salaries.map((salary, index) => (
                <tr
                  key={salary._id}
                  className={`border-b hover:bg-gray-100 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4">
                    ₹{salary.basicSalary.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    ₹{salary.allowances.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-red-600">
                    ₹{salary.deductions.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 font-bold text-green-600">
                    ₹{salary.netSalary.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(salary.payDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        salary.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
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
                  colSpan="6"
                  className="py-12 text-center text-gray-500 text-lg"
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

export default MySalary;