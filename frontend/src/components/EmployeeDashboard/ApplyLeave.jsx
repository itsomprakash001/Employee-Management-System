import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const ApplyLeave = () => {
  const { user, getToken } = useAuth();

  const [leave, setLeave] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [successMessage, setSuccessMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLeave((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert(
        "User information not found. Please login again."
      );
      return;
    }

    const allowedRoles = [
      "admin",
      "manager",
      "hr",
      "tl",
      "employee",
    ];

    if (!allowedRoles.includes(user.role)) {
      alert("You are not allowed to apply for leave.");
      return;
    }

    // Validate dates
    if (
      leave.fromDate &&
      leave.toDate &&
      leave.fromDate > leave.toDate
    ) {
      alert(
        "To Date cannot be earlier than From Date."
      );
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const token = await getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/leave/apply`,
        leave,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage(
          "Leave request submitted successfully!"
        );

        setLeave({
          leaveType: "",
          fromDate: "",
          toDate: "",
          reason: "",
        });

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      console.log(
        "APPLY LEAVE ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.error ||
          "Failed to submit leave request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 font-semibold">
          Loading...
        </div>
      </div>
    );
  }

  const allowedRoles = [
    "admin",
    "manager",
    "hr",
    "tl",
    "employee",
  ];

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600">
            You are not allowed to apply for leave.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-5">

        <h2 className="text-2xl font-bold text-teal-700 mb-5">
          Apply for Leave
        </h2>

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="leaveType"
              className="block font-semibold mb-1"
            >
              Leave Type
            </label>

            <select
              id="leaveType"
              name="leaveType"
              value={leave.leaveType}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">
                Select Leave Type
              </option>

              <option value="Casual Leave">
                Casual Leave
              </option>

              <option value="Sick Leave">
                Sick Leave
              </option>

              <option value="Annual Leave">
                Annual Leave
              </option>

              <option value="Emergency Leave">
                Emergency Leave
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fromDate"
                className="block font-semibold mb-1"
              >
                From Date
              </label>

              <input
                id="fromDate"
                type="date"
                name="fromDate"
                value={leave.fromDate}
                onChange={handleChange}
                max={leave.toDate || undefined}
                required
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label
                htmlFor="toDate"
                className="block font-semibold mb-1"
              >
                To Date
              </label>

              <input
                id="toDate"
                type="date"
                name="toDate"
                value={leave.toDate}
                onChange={handleChange}
                min={leave.fromDate || undefined}
                required
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block font-semibold mb-1"
            >
              Reason
            </label>

            <textarea
              id="reason"
              rows="3"
              name="reason"
              value={leave.reason}
              onChange={handleChange}
              placeholder="Enter the reason for your leave..."
              required
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {loading
              ? "Submitting..."
              : "Submit Leave Request"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;