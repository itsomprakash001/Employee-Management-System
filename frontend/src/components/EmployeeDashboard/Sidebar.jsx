import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCogs,
  FaClipboardList,
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-gray-800 text-white border-r border-gray-300">
      {/* Header */}
      <div className="h-16 bg-teal-500 flex items-center justify-center">
        <h2 className="text-xl font-bold">Employee Portal</h2>
      </div>

      {/* Menu */}
      <div className="mt-5 px-3 space-y-2">

        {/* Dashboard */}
        <NavLink
          to="/employee-dashboard"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive
                ? "bg-teal-500"
                : "hover:bg-teal-600"
            }`
          }
        >
          <FaTachometerAlt size={18} />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/employee-dashboard/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive
                ? "bg-teal-500"
                : "hover:bg-teal-600"
            }`
          }
        >
          <FaUser size={18} />
          <span className="font-medium">My Profile</span>
        </NavLink>

        {/* Apply Leave */}
        <NavLink
          to="/employee-dashboard/apply-leave"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive
                ? "bg-teal-500"
                : "hover:bg-teal-600"
            }`
          }
        >
          <FaCalendarAlt size={18} />
          <span className="font-medium">Apply Leave</span>
        </NavLink>

        {/* My Leaves */}
        <NavLink
          to="/employee-dashboard/my-leaves"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive
                ? "bg-teal-500"
                : "hover:bg-teal-600"
            }`
          }
        >
          <FaClipboardList size={18} />
          <span className="font-medium">My Leaves</span>
        </NavLink>

        {/* Salary */}
        <NavLink
          to="/employee-dashboard/salary"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive
                ? "bg-teal-500"
                : "hover:bg-teal-600"
            }`
          }
        >
          <FaMoneyBillWave size={18} />
          <span className="font-medium">My Salary</span>
        </NavLink>

        {/* Settings */}
<NavLink
    to="/employee-dashboard/settings"
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg ${
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

export default Sidebar;