import React, { useState } from "react";
import axios from "axios";

const Settings = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      return setError(
        "New Password and Confirm Password do not match"
      );
    }


    try {
      setLoading(true);

      const res = await axios.put(
        "http://localhost:3000/api/auth/setting",
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      if (res.data.success) {
        setSuccess("Password changed successfully");

        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }


    } catch (err) {
      console.log(err.response?.data);

      setError(
        err.response?.data?.error ||
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center px-4 mt-6">

      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-5">


        <h2 className="text-2xl font-bold text-teal-600 mb-4 text-center">
          Update Password
        </h2>


        {error && (
          <p className="text-red-600 text-sm text-center mb-3">
            {error}
          </p>
        )}


        {success && (
          <p className="text-green-600 text-sm text-center mb-3">
            {success}
          </p>
        )}



        <form onSubmit={handleSubmit} className="space-y-3">


          <div>
            <label className="block text-sm font-medium mb-1">
              Old Password
            </label>

            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>



          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>



          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>



          <button
  type="submit"
  disabled={loading}
  className={`w-full py-2 rounded-md text-sm font-semibold mt-2 transition duration-200 ${
    loading
      ? "bg-teal-400 cursor-not-allowed"
      : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
  }`}
>
  {loading ? "Updating..." : "Change Password"}
</button>

        </form>


      </div>

    </div>
  );
};

export default Settings;