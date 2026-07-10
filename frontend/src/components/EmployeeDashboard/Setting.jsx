import React, { useState } from "react";
import axios from "axios";

const Setting = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  const clearForm = () => {
    setForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };


  const changePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    // Check password match
    if (form.newPassword !== form.confirmPassword) {

      setError(
        "New Password and Confirm Password do not match"
      );

      clearForm();

      return;
    }


    try {
      setLoading(true);


      const res = await axios.put(
        "http://localhost:3000/api/auth/setting",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      if (res.data.success) {

        setSuccess(
          "Password Changed Successfully"
        );

        clearForm();

      }


    } catch (err) {

      setError(
        err.response?.data?.error || "Something went wrong"
      );


      // Clear password fields after wrong password/error
      clearForm();


    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">


      <h2 className="text-2xl font-bold text-center mb-6 text-teal-600">
        Password Update
      </h2>


      {error && (
        <p className="text-red-600 text-center font-medium mb-4">
          {error}
        </p>
      )}


      {success && (
        <p className="text-green-600 text-center font-medium mb-4">
          {success}
        </p>
      )}



      <form onSubmit={changePassword}>


        <input
          type="password"
          name="oldPassword"
          placeholder="Old Password"
          value={form.oldPassword}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />


        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />


        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />


        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white p-3 rounded transition duration-200 ${
            loading
              ? "bg-teal-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
          }`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>


      </form>


    </div>
  );
};

export default Setting;