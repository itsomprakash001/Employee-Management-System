import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import API_URL from "../../api";

const Salary = () => {
  const { getToken } = useAuth();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/salary/my-salary`,
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
          "GET MY SALARY ERROR:",
          error.response?.status,
          error.response?.data ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (getToken) {
      fetchSalary();
    }
  }, [getToken]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500">
            Loading salary details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-3xl font-bold text-teal-700 mb-6">
          My Salary Details
        </h2>

        {salaries.length > 0 ? (
          <div className="space-y-5">

            {salaries.map((salary) => (
              <div
                key={salary._id}
                className="bg-white rounded-xl shadow-md p-6 border hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <p>
                    <b>Employee ID:</b>{" "}
                    {salary.employeeId?.employeeId ||
                      "N/A"}
                  </p>

                  <p>
                    <b>Name:</b>{" "}
                    {salary.employeeId?.userId?.name ||
                      "N/A"}
                  </p>

                  <p>
                    <b>Basic Salary:</b>{" "}
                    ₹
                    {Number(
                      salary.basicSalary || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p>
                    <b>Allowances:</b>{" "}
                    ₹
                    {Number(
                      salary.allowances || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p>
                    <b>Deductions:</b>{" "}
                    ₹
                    {Number(
                      salary.deductions || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p>
                    <b>Net Salary:</b>{" "}
                    ₹
                    {Number(
                      salary.netSalary || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p>
                    <b>Pay Date:</b>{" "}
                    {salary.payDate
                      ? new Date(
                          salary.payDate
                        ).toLocaleDateString(
                          "en-GB"
                        )
                      : "N/A"}
                  </p>

                  <p>
                    <b>Status:</b>

                    <span
                      className={`ml-2 px-3 py-1 rounded-full ${
                        salary.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {salary.status}
                    </span>
                  </p>

                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500">
              No salary records found.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Salary;