import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaTachometerAlt,
  FaCalendar,
  FaMoneyBillWave,
  FaCogs,
} from "react-icons/fa";

const AdminSidebar = () => {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-gray-800 text-white border-r border-gray-300">

      {/* Header */}
      <div className="h-16 bg-teal-500 flex items-center justify-center">
        <h3 className="text-xl font-bold text-center px-2">
          Employee Management System
        </h3>
      </div>

      {/* Menu */}
      <div className="mt-4 px-3 space-y-2">

        {/* Dashboard */}
        <NavLink
          to="/admin-dashboard"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded transition duration-200 ${
              isActive ? "bg-teal-500" : "hover:bg-teal-600"
            }`
          }
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        {/* Employees */}
        <NavLink
          to="/admin-dashboard/employees"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded transition duration-200 ${
              isActive ? "bg-teal-500" : "hover:bg-teal-600"
            }`
          }
        >
          <FaUsers />
          <span>Employees</span>
        </NavLink>

        {/* Departments */}
        <NavLink
          to="/admin-dashboard/departments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded transition duration-200 ${
              isActive ? "bg-teal-500" : "hover:bg-teal-600"
            }`
          }
        >
          <FaBuilding />
          <span>Departments</span>
        </NavLink>

        {/* Leave */}
        <NavLink
          to="/admin-dashboard/leave"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded transition duration-200 ${
              isActive ? "bg-teal-500" : "hover:bg-teal-600"
            }`
          }
        >
          <FaCalendar />
          <span>Leave</span>
        </NavLink>

        {/* Salary */}
        <NavLink
          to="/admin-dashboard/salary"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded transition duration-200 ${
              isActive ? "bg-teal-500" : "hover:bg-teal-600"
            }`
          }
        >
          <FaMoneyBillWave />
          <span>Salary</span>
        </NavLink>

        {/* Settings */}
        <NavLink
    to="/admin-dashboard/settings"
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded ${
        isActive ? "bg-teal-500" : "hover:bg-teal-600"
      }`
    }
>
    <FaCogs />
    <span>Settings</span>
</NavLink>

      </div>
    </div>
  );
};

export default AdminSidebar;