
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import axios from "axios";

const Add = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    designation: "",
    department: "",
    salary: "",
    password: "",
    role: "",
    image: null,
  });

  useEffect(() => {
    const getDepartments = async () => {
      const data = await fetchDepartments();
      setDepartments(data);
    };

    getDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });

    try {
      const response = await axios.post(
        "http://localhost:3000/api/employee/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Employee added successfully!");

        setTimeout(() => {
          navigate("/admin-dashboard/employees");
        }, 2000);
      }

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">

        <h2 className="text-2xl font-bold mb-5">
          Add New Employee
        </h2>

        {successMessage && (
          <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>

              <select
                name="gender"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marital Status
              </label>

              <select
                name="maritalStatus"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Designation
              </label>

              <input
                type="text"
                name="designation"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>

              <select
                name="department"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">
                  Select Department
                </option>

                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.dep_name}
                  </option>
                ))}

              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary
              </label>

              <input
                type="number"
                name="salary"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>

              <select
                name="role"
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">
                  Select Role
                </option>
                <option value="admin">
                  Admin
                </option>
                <option value="employee">
                  Employee
                </option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                required
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm cursor-pointer bg-white file:bg-teal-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md hover:file:bg-teal-700"
              />
            </div>


          </div>


          <div className="mt-5 flex justify-end">

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md transition"
            >
              Add Employee
            </button>

          </div>


        </form>

      </div>

    </div>
  );
};

export default Add;

