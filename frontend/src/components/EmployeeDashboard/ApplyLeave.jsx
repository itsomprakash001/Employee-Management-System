
import React, { useState } from "react";
import axios from "axios";

const ApplyLeave = () => {
  const [leave, setLeave] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setLeave({
      ...leave,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/leave/apply",
        leave,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Leave request submitted successfully!");

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
      console.log(error);
      alert(error.response?.data?.error || "Failed to submit leave request");
    }
  };

  return (
    <div className="p-4">

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-5">

        <h2 className="text-2xl font-bold text-teal-700 mb-5">
          Apply for Leave
        </h2>


        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
            {successMessage}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Leave Type */}
          <div>
            <label className="block font-semibold mb-1">
              Leave Type
            </label>

            <select
              name="leaveType"
              value={leave.leaveType}
              onChange={handleChange}
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
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


          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block font-semibold mb-1">
                From Date
              </label>

              <input
                type="date"
                name="fromDate"
                value={leave.fromDate}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>


            <div>
              <label className="block font-semibold mb-1">
                To Date
              </label>

              <input
                type="date"
                name="toDate"
                value={leave.toDate}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

          </div>


          {/* Reason */}
          <div>
            <label className="block font-semibold mb-1">
              Reason
            </label>

            <textarea
              rows="3"
              name="reason"
              value={leave.reason}
              onChange={handleChange}
              placeholder="Enter the reason for your leave..."
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />

          </div>


          {/* Button */}
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Submit Leave Request
          </button>


        </form>

      </div>

    </div>
  );
};

export default ApplyLeave;

