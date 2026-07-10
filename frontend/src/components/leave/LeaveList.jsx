import React, { useEffect, useState } from "react";
import axios from "axios";

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/leave",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setLeaves(response.data.leaves);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/leave/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        fetchLeaves();
      }
    } catch (error) {
      console.log(error);
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

  const filteredLeaves = leaves.filter((leave) =>
  leave.employeeName
    ?.toLowerCase()
    .includes(search.toLowerCase())
);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-teal-700 mb-6">
        Leave Management
      </h2>

      <div className="flex justify-end mb-4">
  <input
    type="text"
    placeholder="Search by employee name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border border-gray-300 rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-teal-500"
  />
</div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="w-full text-center text-sm">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Department</th>
              <th className="p-3">Leave Type</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Days</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave, index) => (
                <tr
                  key={leave._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{index + 1}</td>

                  <td className="p-3 font-medium">
                    {leave.employeeName}
                  </td>

                  <td className="p-3">
                    {leave.department}
                  </td>

                  <td className="p-3">
                    {leave.leaveType}
                  </td>

                  <td className="p-3">
                    {new Date(leave.fromDate).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-3">
                    {new Date(leave.toDate).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-3">
                    {leave.totalDays}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          updateStatus(leave._id, "Approved")
                        }
                        className="w-20 py-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs cursor-pointer transition"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(leave._id, "Rejected")
                        }
                        className="w-20 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs cursor-pointer transition"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-8 text-gray-500">
                  No matching employee found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveList;