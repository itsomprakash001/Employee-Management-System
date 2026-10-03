import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const MyLeaves = () => {
  const { user, getToken } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/leave/my-leave`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setLeaves(response.data.leaves || []);
      }
    } catch (error) {
      console.log(
        "GET MY LEAVES ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && getToken) {
      fetchLeaves();
    }
  }, [user, getToken]);

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-GB");
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-medium">
          Loading leaves...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-medium">
          User information not found.
        </div>
      </div>
    );
  }

  if (user.role !== "employee") {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl shadow-md p-7 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-sm text-gray-600">
            This page is available only to employees.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-5">
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-black">
          My Leave Requests
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View and manage your leave requests
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">
                Leave Type
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                From
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                To
              </th>

              <th className="px-4 py-3 text-center font-semibold">
                Days
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                Reason
              </th>

              <th className="px-4 py-3 text-center font-semibold">
                Status
              </th>

              <th className="px-4 py-3 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {leave.leaveType || "N/A"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(leave.fromDate)}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(leave.toDate)}
                  </td>

                  <td className="px-4 py-3 text-center font-medium text-gray-700">
                    {leave.totalDays ?? "N/A"}
                  </td>

                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {leave.reason || "N/A"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {leave.status === "Pending" ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/employee-dashboard/edit-leave/${leave._id}`
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    ) : leave.status === "Approved" ? (
                      <span className="text-green-600 text-xs font-semibold">
                        Approved
                      </span>
                    ) : (
                      <span className="text-red-600 text-xs font-semibold">
                        Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-10 text-center text-gray-500"
                >
                  No leave requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyLeaves;