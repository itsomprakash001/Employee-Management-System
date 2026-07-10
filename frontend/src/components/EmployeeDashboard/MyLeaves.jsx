import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/leave/my-leave",
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

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-teal-700 mb-6">
        My Leave Requests
      </h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-center">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="p-3">Leave Type</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Days</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{leave.leaveType}</td>

                  <td className="p-3">
                    {new Date(leave.fromDate).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-3">
                    {new Date(leave.toDate).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-3">{leave.totalDays}</td>

                  <td className="p-3">{leave.reason}</td>

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
                <td colSpan="7" className="py-6 text-gray-500">
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