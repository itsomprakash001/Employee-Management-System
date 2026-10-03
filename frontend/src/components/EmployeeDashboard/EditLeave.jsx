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
          alert("Authentication token not found. Please login again.");
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

          if (data.status !== "Pending") {
            alert("Only pending leave requests can be edited.");
            navigate("/employee-dashboard/my-leaves");
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
          error.response?.data || error.message
        );

        alert(
          error.response?.data?.error ||
            "Unable to fetch leave details"
        );

        navigate("/employee-dashboard/my-leaves");
      } finally {
        setLoading(false);
      }
    };

    if (getToken && id && user) {
      if (user.role !== "employee") {
        alert("Only employees can edit their leave requests.");
        navigate("/employee-dashboard/my-leaves");
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
      alert("Only employees can update leave requests.");
      return;
    }

    if (
      leave.fromDate &&
      leave.toDate &&
      leave.fromDate > leave.toDate
    ) {
      alert("To Date cannot be earlier than From Date.");
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
        alert("Authentication token not found. Please login again.");
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
        setSuccessMessage("Leave updated successfully!");

        setTimeout(() => {
          navigate("/employee-dashboard/my-leaves");
        }, 1200);
      }
    } catch (error) {
      console.log(
        "UPDATE LEAVE ERROR:",
        error.response?.status,
        error.response?.data || error.message
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
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-medium">
          Loading leave details...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "employee") {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl shadow-md p-7 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-sm text-gray-600">
            Only employees can edit their leave requests.
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
            Edit Leave Request
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Update your pending leave request
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 text-sm font-semibold text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <option value="">Select Leave Type</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Leave">Annual Leave</option>
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

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() =>
                  navigate("/employee-dashboard/my-leaves")
                }
                className="
                  px-4
                  py-2.5
                  rounded-lg
                  bg-gray-500
                  hover:bg-gray-600
                  text-white
                  text-sm
                  font-semibold
                  transition
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updating}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-teal-600
                  hover:bg-teal-700
                  disabled:bg-gray-400
                  disabled:cursor-not-allowed
                  text-white
                  text-sm
                  font-semibold
                  transition
                "
              >
                {updating ? "Updating..." : "Update Leave"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLeave;