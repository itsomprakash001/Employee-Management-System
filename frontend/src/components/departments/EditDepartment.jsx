import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [department, setDepartment] = useState({
    dep_name: "",
    description: "",
  });

  const [depLoading, setDepLoading] = useState(false);

  useEffect(() => {
    const fetchDepartment = async () => {
      setDepLoading(true);

      try {
        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/department/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setDepartment({
            dep_name: response.data.department?.dep_name || "",
            description:
              response.data.department?.description || "",
          });
        }
      } catch (error) {
        console.log(
          "GET DEPARTMENT ERROR:",
          error.response?.status,
          error.response?.data || error.message
        );

        alert(
          error.response?.data?.error ||
            "Something went wrong"
        );
      } finally {
        setDepLoading(false);
      }
    };

    if (getToken && id) {
      fetchDepartment();
    }
  }, [id, getToken]);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/department/${id}`,
        department,
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
        "UPDATE DEPARTMENT ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Unable to update department"
      );
    }
  };

  if (depLoading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">

      <h2 className="text-2xl font-bold mb-6">
        Edit Department
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
            id="dep_name"
            name="dep_name"
            type="text"
            value={department.dep_name}
            onChange={handleChange}
            placeholder="Enter Department Name"
            autoComplete="organization-title"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            onChange={handleChange}
            placeholder="Description"
            autoComplete="off"
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows="4"
          />
        </div>

        <button
          id="update-department"
          type="submit"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white font-bold py-2 px-4 rounded cursor-pointer"
        >
          Update Department
        </button>

      </form>
    </div>
  );
};

export default EditDepartment;