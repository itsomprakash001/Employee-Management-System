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

  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedRoles = [
    "manager",
    "hr",
    "tl",
    "employee",
  ];

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

    if (!allowedRoles.includes(user.role)) {
      alert("You are not allowed to apply for leave.");
      return;
    }

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

    if (!leave.leaveType) {
      alert("Please select a leave type.");
      return;
    }

    if (!leave.reason.trim()) {
      alert("Please enter a reason for your leave.");
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage("");

      const token = await getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/leave/apply`,
        {
          ...leave,
          reason: leave.reason.trim(),
        },
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
        error.response?.data || error.message
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
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-medium">
          Loading...
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white shadow-md rounded-xl p-7 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600 text-sm">
            You are not allowed to apply for leave.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-5">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-black">
            Apply for Leave
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Submit a leave request for approval
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 font-medium text-sm text-center">
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
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Leave Type
              </label>

              <select
                id="leaveType"
                name="leaveType"
                value={leave.leaveType}
                onChange={handleChange}
                required
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-teal-500
                "
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
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
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
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-teal-500
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="toDate"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
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
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-teal-500
                  "
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Reason
              </label>

              <textarea
                id="reason"
                name="reason"
                rows="3"
                value={leave.reason}
                onChange={handleChange}
                placeholder="Enter the reason for your leave..."
                required
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  resize-none
                  focus:ring-2
                  focus:ring-teal-500
                "
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-teal-600
                  hover:bg-teal-700
                  disabled:bg-gray-400
                  disabled:cursor-not-allowed
                  text-white
                  px-5
                  py-2.5
                  rounded-lg
                  text-sm
                  font-semibold
                  transition
                "
              >
                {loading
                  ? "Submitting..."
                  : "Submit Leave Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;