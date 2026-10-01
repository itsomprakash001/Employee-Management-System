
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const EditLeave = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();

  const [leave, setLeave] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        setLoading(true);

        const token = await getToken();

        if (!token) {
          alert(
            "Authentication token not found. Please login again."
          );
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/leave/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const data = response.data.leave;

          // Only pending leaves can be edited
          if (data.status !== "Pending") {
            alert(
              "Only pending leave requests can be edited."
            );

            navigate(
              "/employee-dashboard/my-leaves"
            );
            return;
          }

          setLeave({
            leaveType: data.leaveType || "",
            fromDate: data.fromDate
              ? data.fromDate.split("T")[0]
              : "",
            toDate: data.toDate
              ? data.toDate.split("T")[0]
              : "",
            reason: data.reason || "",
          });
        }
      } catch (error) {
        console.log(
          "GET LEAVE ERROR:",
          error.response?.status,
          error.response?.data ||
            error.message
        );

        alert(
          error.response?.data?.error ||
            "Unable to fetch leave details"
        );

        navigate(
          "/employee-dashboard/my-leaves"
        );
      } finally {
        setLoading(false);
      }
    };

    if (getToken && id && user) {
      if (user.role !== "employee") {
        alert(
          "Only employees can edit their leave requests."
        );

        navigate(
          "/employee-dashboard/my-leaves"
        );
        return;
      }

      fetchLeave();
    }
  }, [id, getToken, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLeave((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "employee") {
      alert(
        "Only employees can update leave requests."
      );
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
      alert("Please enter a reason.");
      return;
    }

    try {
      setUpdating(true);

      const token = await getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/leave/edit/${id}`,
        {
          leaveType: leave.leaveType,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
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
          "Leave updated successfully!"
        );

        setTimeout(() => {
          navigate(
            "/employee-dashboard/my-leaves"
          );
        }, 1500);
      }
    } catch (error) {
      console.log(
        "UPDATE LEAVE ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.error ||
          "Unable to update leave"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 font-semibold">
          Loading leave details...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "employee") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600">
            Only employees can edit their leave requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">

        <h2 className="text-2xl font-bold text-teal-700 mb-6">
          Edit Leave Request
        </h2>

        {successMessage && (
          <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="leaveType"
              className="block mb-2 font-medium"
            >
              Leave Type
            </label>

            <select
              id="leaveType"
              name="leaveType"
              value={leave.leaveType}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">
                Select Leave
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
                className="block mb-2 font-medium"
              >
                From Date
              </label>

              <input
                id="fromDate"
                type="date"
                name="fromDate"
                value={leave.fromDate}
                onChange={handleChange}
                max={
                  leave.toDate || undefined
                }
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="toDate"
                className="block mb-2 font-medium"
              >
                To Date
              </label>

              <input
                id="toDate"
                type="date"
                name="toDate"
                value={leave.toDate}
                onChange={handleChange}
                min={
                  leave.fromDate || undefined
                }
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block mb-2 font-medium"
            >
              Reason
            </label>

            <textarea
              id="reason"
              name="reason"
              rows="4"
              value={leave.reason}
              onChange={handleChange}
              placeholder="Enter the reason for your leave..."
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/employee-dashboard/my-leaves"
                )
              }
              className="px-5 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition cursor-pointer"
            >
              {updating
                ? "Updating..."
                : "Update Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeave;