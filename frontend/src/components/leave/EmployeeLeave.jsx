import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const EmployeeLeave = () => {
  const { id } = useParams();
  const { getToken } = useAuth();

  const [employee, setEmployee] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);

        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const res = await axios.get(
          `${API_URL}/api/leave/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setLeaves(res.data.leaves || []);
          setEmployee(res.data.employee || {});
        }
      } catch (err) {
        console.log(
          "GET EMPLOYEE LEAVES ERROR:",
          err.response?.status,
          err.response?.data || err.message
        );

        alert(
          err.response?.data?.error ||
            "Unable to fetch employee leave history"
        );
      } finally {
        setLoading(false);
      }
    };

    if (getToken && id) {
      fetchLeaves();
    }
  }, [id, getToken]);

  const badgeColor = (status) => {
    if (status === "Approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-medium">
          Loading leave history...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-5">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">
          Employee Leave History
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View leave records and status for this employee
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Employee Name
            </p>

            <h3 className="text-lg font-semibold text-teal-700">
              {employee.name || "N/A"}
            </h3>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">
              Department
            </p>

            <h3 className="text-lg font-semibold text-teal-700">
              {employee.department || "N/A"}
            </h3>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">
              Employee Code
            </p>

            <h3 className="text-lg font-semibold text-teal-700">
              {employee.employeeCode || "N/A"}
            </h3>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">
              Role
            </p>

            <h3 className="text-lg font-semibold text-teal-700 capitalize">
              {employee.role || "N/A"}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-3 py-3 text-center">
                  S.No
                </th>

                <th className="px-3 py-3 text-center">
                  Leave Type
                </th>

                <th className="px-3 py-3 text-center">
                  From
                </th>

                <th className="px-3 py-3 text-center">
                  To
                </th>

                <th className="px-3 py-3 text-center">
                  Days
                </th>

                <th className="px-3 py-3 text-left">
                  Reason
                </th>

                <th className="px-3 py-3 text-center">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave, index) => (
                  <tr
                    key={leave._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-3 py-2.5 text-center">
                      {index + 1}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      {leave.leaveType || "N/A"}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      {leave.fromDate
                        ? new Date(
                            leave.fromDate
                          ).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      {leave.toDate
                        ? new Date(
                            leave.toDate
                          ).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>

                    <td className="px-3 py-2.5 text-center font-medium">
                      {leave.totalDays || 0}
                    </td>

                    <td className="px-3 py-2.5 max-w-xs">
                      <span className="line-clamp-2">
                        {leave.reason || "N/A"}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`
                          inline-block
                          px-2.5
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${badgeColor(leave.status)}
                        `}
                      >
                        {leave.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >
                    No leave records found
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

export default EmployeeLeave;