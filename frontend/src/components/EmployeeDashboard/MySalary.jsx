import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const MySalary = () => {
  const { getToken } = useAuth();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken) {
      fetchSalary();
    }
  }, [getToken]);

  const fetchSalary = async () => {
    try {
      const token = await getToken();

      if (!token) {
        console.log("CLERK TOKEN NOT FOUND");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/salary/my-salary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "MY SALARY RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setSalaries(response.data.salaries || []);
      }
    } catch (error) {
      console.error(
        "GET MY SALARY ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold">
          Loading salary...
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6">

      

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-teal-700">
          My Salary History
        </h1>

        <p className="text-gray-500 mt-1">
          View your salary details and payment history.
        </p>
      </div>

      

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        <table className="min-w-full">

          <thead className="bg-teal-600 text-white">

            <tr>
              <th className="px-6 py-4 text-left">
                Basic Salary
              </th>

              <th className="px-6 py-4 text-left">
                Allowances
              </th>

              <th className="px-6 py-4 text-left">
                Deductions
              </th>

              <th className="px-6 py-4 text-left">
                Net Salary
              </th>

              <th className="px-6 py-4 text-left">
                Pay Date
              </th>

              <th className="px-6 py-4 text-center">
                Status
              </th>
            </tr>

          </thead>

          <tbody>

            {salaries.length > 0 ? (

              salaries.map((salary, index) => (

                <tr
                  key={salary._id}
                  className={`border-b hover:bg-gray-100 transition ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  }`}
                >

                  <td className="px-6 py-4">
                    ₹
                    {Number(
                      salary.basicSalary || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    ₹
                    {Number(
                      salary.allowances || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-red-600">
                    ₹
                    {Number(
                      salary.deductions || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4 font-bold text-green-600">
                    ₹
                    {Number(
                      salary.netSalary || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    {salary.payDate
                      ? new Date(
                          salary.payDate
                        ).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
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