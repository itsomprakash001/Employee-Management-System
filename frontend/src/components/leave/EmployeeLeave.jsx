import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EmployeeLeave = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState({});
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/leave/employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setLeaves(res.data.leaves);
        setEmployee(res.data.employee);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const badgeColor = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-teal-700 mb-6">
        Employee Leave History
      </h2>

      {/* Employee Details */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-500 text-sm">Employee Name</p>
            <h3 className="text-xl font-semibold text-teal-700">
              {employee.name}
            </h3>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Department</p>
            <h3 className="text-xl font-semibold text-teal-700">
              {employee.department}
            </h3>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Employee Code</p>
            <h3 className="text-xl font-semibold text-teal-700">
              {employee.employeeCode}
            </h3>
          </div>
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Leave Type</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Days</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave, index) => (
                <tr
                  key={leave._id}
                  className="border-b text-center hover:bg-gray-50"
                >
                  <td className="p-3">{index + 1}</td>

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
                      className={`px-3 py-1 rounded-full font-medium ${badgeColor(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No Leave Record Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeLeave;