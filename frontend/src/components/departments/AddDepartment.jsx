import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const AddDepartment = () => {
  const [department, setDepartment] = useState({
    dep_name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { getToken } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!department.dep_name.trim()) {
      alert("Department name is required.");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/department/add",
        {
          dep_name: department.dep_name.trim(),
          description: department.description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        navigate("/admin-dashboard/departments");
      }
    } catch (error) {
      console.log(
        "ADD DEPARTMENT ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Something went wrong while adding department"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6">
        Add Department
      </h2>

      <form onSubmit={handleSubmit}>
        
        <div>
          <label
            htmlFor="dep_name"
            className="text-sm font-medium text-gray-700"
          >
            Department Name
          </label>

          <input
            type="text"
            id="dep_name"
            name="dep_name"
            value={department.dep_name}
            onChange={handleChange}
            placeholder="Enter Department Name"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        
        <div className="mt-3">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={department.description}
            placeholder="Enter Description"
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            rows="4"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            mt-6
            bg-teal-600
            hover:bg-teal-700
            hover:scale-105
            hover:shadow-lg
            transition-all
            duration-300
            text-white
            font-bold
            py-2
            px-4
            rounded
            cursor-pointer
            disabled:opacity-50
            disabled:cursor-not-allowed
            disabled:hover:scale-100
          "
        >
          {loading ? "Adding..." : "Add Department"}
        </button>
      </form>
    </div>
  );
};

export default AddDepartment;