import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditLeave = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [leave, setLeave] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchLeave();
  }, []);

  const fetchLeave = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/leave/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const data = response.data.leave;

        setLeave({
          leaveType: data.leaveType,
          fromDate: data.fromDate.split("T")[0],
          toDate: data.toDate.split("T")[0],
          reason: data.reason,
        });
      }
    } catch (error) {
      console.log(error);
      alert("Unable to fetch leave details");
    }
  };


  const handleChange = (e) => {
    setLeave({
      ...leave,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:3000/api/leave/edit/${id}`,
        leave,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      if (response.data.success) {

        setSuccessMessage("Leave updated successfully!");

        setTimeout(() => {
          navigate("/employee-dashboard/my-leaves");
        }, 2000);

      }

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Unable to update leave");
    }
  };


  return (
    <div className="p-6">

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">


        <h2 className="text-2xl font-bold text-teal-700 mb-6">
          Edit Leave Request
        </h2>


        {/* Success Message */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
            {successMessage}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-5">


          <div>
            <label className="block mb-2 font-medium">
              Leave Type
            </label>

            <select
              name="leaveType"
              value={leave.leaveType}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>


          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block mb-2 font-medium">
                From Date
              </label>

              <input
                type="date"
                name="fromDate"
                value={leave.fromDate}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>


            <div>
              <label className="block mb-2 font-medium">
                To Date
              </label>

              <input
                type="date"
                name="toDate"
                value={leave.toDate}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

          </div>


          <div>
            <label className="block mb-2 font-medium">
              Reason
            </label>

            <textarea
              name="reason"
              rows="4"
              value={leave.reason}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />

          </div>


          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate("/employee-dashboard/my-leaves")}
              className="px-5 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition cursor-pointer"
            >
              Cancel
            </button>


            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer"
            >
              Update Leave
            </button>


          </div>


        </form>

      </div>

    </div>
  );
};

export default EditLeave;

