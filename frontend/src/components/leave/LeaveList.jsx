import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

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

const LeaveList = () => {
  const { user, getToken } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        console.log("CLERK TOKEN NOT FOUND");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/leave`,
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
        "GET LEAVES ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Unable to fetch leave requests"
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

  const updateStatus = async (id, status) => {
    try {
      const token = await getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/leave/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchLeaves();
      }
    } catch (error) {
      console.log(
        "UPDATE LEAVE STATUS ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Unable to update leave status"
      );
    }
  };

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

  const canManageLeave = (leave) => {
    if (!user || !leave) {
      return false;
    }

    if (user.role === "employee") {
      return false;
    }

    const targetRole = leave.employeeRole;

    if (!targetRole) {
      return false;
    }

    return canManageRole(
      user.role,
      targetRole
    );
  };

  const filteredLeaves = leaves.filter((leave) => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) {
      return true;
    }

    return (
      leave.employeeName
        ?.toLowerCase()
        .includes(searchText) ||
      leave.employeeRole
        ?.toLowerCase()
        .includes(searchText) ||
      leave.department
        ?.toLowerCase()
        .includes(searchText) ||
      leave.leaveType
        ?.toLowerCase()
        .includes(searchText) ||
      leave.status
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 font-semibold">
          Loading leave requests...
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gray-100 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-teal-700">
          Leave Management
        </h2>

        <input
          type="text"
          placeholder="Search employee, role, department..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            border
            border-gray-300
            rounded-lg
            px-3
            py-1.5
            w-64
            text-xs
            bg-white
            focus:outline-none
            focus:ring-2
            focus:ring-teal-500
          "
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-center text-[11px]">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-2 py-1.5">
                  S.No
                </th>

                <th className="px-2 py-1.5">
                  Employee
                </th>

                <th className="px-2 py-1.5">
                  Role
                </th>

                <th className="px-2 py-1.5">
                  Department
                </th>

                <th className="px-2 py-1.5">
                  Leave Type
                </th>

                <th className="px-2 py-1.5">
                  From
                </th>

                <th className="px-2 py-1.5">
                  To
                </th>

                <th className="px-2 py-1.5">
                  Days
                </th>

                <th className="px-2 py-1.5">
                  Status
                </th>

                <th className="px-2 py-1.5">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave, index) => {
                  const canApproveReject =
                    leave.status === "Pending" &&
                    canManageLeave(leave);

                  return (
                    <tr
                      key={leave._id}
                      className="
                        border-b
                        hover:bg-gray-50
                        transition
                      "
                    >
                      <td className="px-2 py-1.5">
                        {index + 1}
                      </td>

                      <td className="px-2 py-1.5 font-medium">
                        {leave.employeeName || "N/A"}
                      </td>

                      <td className="px-2 py-1.5 capitalize">
                        {leave.employeeRole || "N/A"}
                      </td>

                      <td className="px-2 py-1.5">
                        {leave.department || "N/A"}
                      </td>

                      <td className="px-2 py-1.5">
                        {leave.leaveType}
                      </td>

                      <td className="px-2 py-1.5">
                        {leave.fromDate
                          ? new Date(
                              leave.fromDate
                            ).toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>

                      <td className="px-2 py-1.5">
                        {leave.toDate
                          ? new Date(
                              leave.toDate
                            ).toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>

                      <td className="px-2 py-1.5">
                        {leave.totalDays}
                      </td>

                      <td className="px-2 py-1.5">
                        <span
                          className={`
                            px-2
                            py-0.5
                            rounded-full
                            text-[10px]
                            font-semibold
                            ${getStatusColor(
                              leave.status
                            )}
                          `}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="px-2 py-1.5">
                        {canApproveReject ? (
                          <div className="flex justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  leave._id,
                                  "Approved"
                                )
                              }
                              className="
                                px-2.5
                                py-0.5
                                rounded
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                text-[10px]
                                cursor-pointer
                              "
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  leave._id,
                                  "Rejected"
                                )
                              }
                              className="
                                px-2.5
                                py-0.5
                                rounded
                                bg-red-600
                                hover:bg-red-700
                                text-white
                                text-[10px]
                                cursor-pointer
                              "
                            >
                              Reject
                            </button>
                          </div>
                        ) : leave.status === "Pending" ? (
                          <span className="text-gray-500 text-[10px]">
                            Awaiting approval
                          </span>
                        ) : leave.status === "Approved" ? (
                          <span className="text-green-600 font-semibold text-[10px]">
                            Approved
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold text-[10px]">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="py-6 text-gray-500"
                  >
                    No matching leave requests found
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

export default LeaveList;