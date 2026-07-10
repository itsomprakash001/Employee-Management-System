import React, { useEffect, useState } from "react";
import axios from "axios";
import SummaryCard from "./SummaryCard";

import {
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaFileAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";

const AdminSummary = () => {
  const [dashboard, setDashboard] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSalaryRecords: 0,
    totalSalaryPaid: 0,
    totalLeaves: 0,
    approvedLeaves: 0,
    pendingLeaves: 0,
    rejectedLeaves: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/dashboard",  
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60 text-xl font-bold">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<FaUsers />}
          text="Total Employees"
          number={dashboard.totalEmployees}
          color="bg-blue-600"
        />

        <SummaryCard
          icon={<FaBuilding />}
          text="Departments"
          number={dashboard.totalDepartments}
          color="bg-green-600"
        />

        <SummaryCard
          icon={<FaMoneyBillWave />}
          text="Salary Records"
          number={dashboard.totalSalaryRecords}
          color="bg-purple-600"
        />

        <SummaryCard
          icon={<FaMoneyBillWave />}
          text="Total Salary Paid"
          number={`₹${dashboard.totalSalaryPaid}`}
          color="bg-red-600"
        />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Leave Statistics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            icon={<FaFileAlt />}
            text="Leave Applied"
            number={dashboard.totalLeaves}
            color="bg-indigo-600"
          />

          <SummaryCard
            icon={<FaCheckCircle />}
            text="Approved"
            number={dashboard.approvedLeaves}
            color="bg-green-600"
          />

          <SummaryCard
            icon={<FaHourglassHalf />}
            text="Pending"
            number={dashboard.pendingLeaves}
            color="bg-yellow-500"
          />

          <SummaryCard
            icon={<FaTimesCircle />}
            text="Rejected"
            number={dashboard.rejectedLeaves}
            color="bg-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;   