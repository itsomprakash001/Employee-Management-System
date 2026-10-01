import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaTachometerAlt,
  FaCalendar,
  FaMoneyBillWave,
  FaCogs,
  FaPlus,
} from "react-icons/fa";
import { useAuth } from "../../context/useAuth";

const AdminSidebar = () => {
  const { user } = useAuth();

  const role = user?.role;

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded transition duration-200 ${
      isActive
        ? "bg-teal-500"
        : "hover:bg-teal-600"
    }`;

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-gray-800 text-white border-r border-gray-300">


      <div className="h-16 bg-teal-500 flex items-center justify-center">
        <h3 className="text-xl font-bold text-center px-2">
          Employee Management System
        </h3>
      </div>


      <div className="mt-4 px-3 space-y-2">

        

        <NavLink
          to="/admin-dashboard"
          end
          className={menuClass}
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        {["admin", "manager", "hr", "tl"].includes(role) && (
          <NavLink
            to="/admin-dashboard/employees"
            className={menuClass}
          >
            <FaUsers />
            <span>Employees</span>
          </NavLink>
        )}


        {["admin", "manager", "hr", "tl"].includes(role) && (
          <NavLink
            to="/admin-dashboard/departments"
            className={menuClass}
          >
            <FaBuilding />
            <span>Departments</span>
          </NavLink>
        )}


        {["admin", "manager"].includes(role) && (
          <NavLink
            to="/admin-dashboard/add-department"
            className={menuClass}
          >
            <FaPlus />
            <span>Add Department</span>
          </NavLink>
        )}


        {["manager", "hr", "tl"].includes(role) && (
          <NavLink
            to="/admin-dashboard/apply-leave"
            className={menuClass}
          >
            <FaCalendar />
            <span>Apply Leave</span>
          </NavLink>
        )}


        {["admin", "manager", "hr", "tl"].includes(role) && (
          <NavLink
            to="/admin-dashboard/leave"
            className={menuClass}
          >
            <FaCalendar />
            <span>Leave</span>
          </NavLink>
        )}


        {["admin", "manager", "hr", "tl"].includes(role) && (
          <NavLink
            to="/admin-dashboard/salary"
            className={menuClass}
          >
            <FaMoneyBillWave />
            <span>Salary</span>
          </NavLink>
        )}


        <NavLink
          to="/admin-dashboard/settings"
          className={menuClass}
        >
          <FaCogs />
          <span>Settings</span>
        </NavLink>

      </div>
    </div>
  );
};

export default AdminSidebar;