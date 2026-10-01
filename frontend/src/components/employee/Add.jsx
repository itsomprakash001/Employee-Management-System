import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const Add = () => {
  const navigate = useNavigate();

  const { user, getToken } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);


  const roleOptions = {
    admin: [
      {
        value: "manager",
        label: "Manager",
      },
    ],

    manager: [
      {
        value: "hr",
        label: "HR",
      },
    ],

    hr: [
      {
        value: "tl",
        label: "Team Leader",
      },
    ],

    tl: [
      {
        value: "employee",
        label: "Employee",
      },
    ],

    employee: [],
  };

  const availableRoles =
    roleOptions[user?.role] || [];

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    employeeId: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    designation: "",
    department: "",
    salary: "",
    role: "",
    image: null,
  });


  useEffect(() => {
    if (availableRoles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        role: availableRoles[0].value,
      }));
    }
  }, [user?.role]);

 

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const data = await fetchDepartments(getToken);
        setDepartments(data);
      } catch (error) {
        console.log(
          "GET DEPARTMENTS ERROR:",
          error
        );
      }
    };

    if (getToken) {
      getDepartments();
    }
  }, [getToken]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image:
          files && files.length > 0
            ? files[0]
            : null,
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

    if (!formData.role) {
      alert("Please select a role.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    const formDataObj = new FormData();

    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== null &&
        formData[key] !== ""
      ) {
        formDataObj.append(
          key,
          formData[key]
        );
      }
    });

    try {
      const token = await getToken();

      if (!token) {
        console.log(
          "CLERK TOKEN NOT FOUND"
        );

        alert(
          "Authentication token not found. Please login again."
        );

        return;
      }

      console.log(
        "CLERK TOKEN FOUND FOR ADD EMPLOYEE"
      );

      const response = await axios.post(
        "http://localhost:5000/api/employee/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage(
          `${availableRoles[0]?.label || "Employee"} added successfully! They can login using their email and OTP.`
        );

        setTimeout(() => {
          navigate(
            "/admin-dashboard/employees"
          );
        }, 2000);
      }
    } catch (error) {
      console.log(
        "ADD EMPLOYEE ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.error ||
          "Something went wrong while adding employee"
      );
    } finally {
      setLoading(false);
    }
  };


  if (
    user &&
    availableRoles.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600">
            You do not have permission to add another user.
          </p>
        </div>
      </div>
    );
  }

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
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="employee@example.com"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />

              <p className="mt-1 text-xs text-gray-500">
                This email will be used by the user
                to login with OTP.
              </p>
            </div>


            <div>
              <label
                htmlFor="employeeId"
                className="block text-sm font-medium text-gray-700"
              >
                Employee ID
              </label>

              <input
                id="employeeId"
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>

              <input
                id="dob"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                autoComplete="bday"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                autoComplete="sex"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">
                  Select Gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>


            <div>
              <label
                htmlFor="maritalStatus"
                className="block text-sm font-medium text-gray-700"
              >
                Marital Status
              </label>

              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">
                  Select Status
                </option>

                <option value="single">
                  Single
                </option>

                <option value="married">
                  Married
                </option>

                <option value="divorced">
                  Divorced
                </option>

                <option value="widowed">
                  Widowed
                </option>
              </select>
            </div>

           

            <div>
              <label
                htmlFor="designation"
                className="block text-sm font-medium text-gray-700"
              >
                Designation
              </label>

              <input
                id="designation"
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                autoComplete="organization-title"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700"
              >
                Department
              </label>

              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                autoComplete="organization"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">
                  Select Department
                </option>

                {departments.map((dep) => (
                  <option
                    key={dep._id}
                    value={dep._id}
                  >
                    {dep.dep_name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-700"
              >
                Salary
              </label>

              <input
                id="salary"
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                autoComplete="off"
                min="0"
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              />
            </div>


            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 p-2.5 w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">
                  Select Role
                </option>

                {availableRoles.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Image
              </label>

              <input
                id="image"
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
              id="add-employee"
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition"
            >
              {loading
                ? "Adding..."
                : "Add User"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Add;