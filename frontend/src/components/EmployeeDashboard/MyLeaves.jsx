
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
        console.log("CLERK TOKEN NOT FOUND");
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

      console.log(
        "MY LEAVES RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setLeaves(response.data.leaves || []);
      }
    } catch (error) {
      console.log(
        "GET MY LEAVES ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-GB"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold">
          Loading leaves...
        </h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-xl font-semibold text-gray-600">
          User information not found.
        </h2>
      </div>
    );
  }

  if (user.role !== "employee") {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600">
            This page is available only to employees.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-teal-700 mb-6">
        My Leave Requests
      </h2>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full min-w-[800px] text-center">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="p-3">
                Leave Type
              </th>

              <th className="p-3">
                From
              </th>

              <th className="p-3">
                To
              </th>

              <th className="p-3">
                Days
              </th>

              <th className="p-3">
                Reason
              </th>

              <th className="p-3">
                Status
              </th>

              <th className="p-3">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    {leave.leaveType || "N/A"}
                  </td>

                  <td className="p-3">
                    {formatDate(leave.fromDate)}
                  </td>

                  <td className="p-3">
                    {formatDate(leave.toDate)}
                  </td>

                  <td className="p-3">
                    {leave.totalDays ?? "N/A"}
                  </td>

                  <td className="p-3 max-w-xs">
                    {leave.reason || "N/A"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-4 py-1 rounded-full font-semibold ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="p-3">
                    {leave.status === "Pending" ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/employee-dashboard/edit-leave/${leave._id}`
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full text-sm transition cursor-pointer"
                      >
                        Edit
                      </button>
                    ) : leave.status === "Approved" ? (
                      <span className="text-green-600 font-semibold">
                        Leave is Approved
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Leave is Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-8 text-gray-500"
                >
                  No Leave Requests Found
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