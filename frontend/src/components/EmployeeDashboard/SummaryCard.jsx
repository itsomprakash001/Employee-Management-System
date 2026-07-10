import React from "react";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../context/authContext";

const SummaryCard = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center bg-white rounded-xl shadow-lg p-5 w-full max-w-md">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-600 text-white text-3xl">
        <FaUser />
      </div>

      <div className="ml-5">
  <p className="text-sm font-medium uppercase tracking-wider text-teal-600">
    Employee Dashboard
  </p>

  <h2 className="text-2xl font-bold text-gray-800 mt-1">
    Welcome Back, {user?.name || "Employee"} 👋
  </h2>

  <p className="text-sm text-gray-500 mt-1">
    We wish you a productive and successful day.
  </p>
</div>
      </div>
    
  );
};

export default SummaryCard;