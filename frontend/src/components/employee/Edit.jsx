import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { fetchDepartments } from "../../utils/EmployeeHelper";

const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    designation: "",
    department: "",
    salary: "",
    role: "",
  });


  useEffect(() => {
    const getDepartments = async () => {
      const data = await fetchDepartments();
      setDepartments(data);
    };

    getDepartments();
  }, []);



  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          const emp = response.data.employee;

          setFormData({
            employeeId: emp.employeeId || "",
            dob: emp.dob ? emp.dob.substring(0, 10) : "",
            gender: emp.gender || "",
            maritalStatus: emp.maritalStatus || "",
            designation: emp.designation || "",
            department: emp.department?._id || "",
            salary: emp.salary || "",
            role: emp.userId?.role || "",
          });
        }

      } catch (error) {
        alert(error.response?.data?.error || "Failed to fetch employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();

  }, [id]);



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await axios.put(
        `http://localhost:3000/api/employee/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      if (response.data.success) {

        setSuccessMessage("Employee updated successfully!");

        setTimeout(() => {
          navigate("/admin-dashboard/employees");
        }, 2000);

      }


    } catch (error) {
      alert(error.response?.data?.error || "Failed to update employee");
    }
  };



  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }



  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">

      <h2 className="text-2xl font-bold mb-6">
        Edit Employee
      </h2>


      {/* Success Message */}
      {successMessage && (
        <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
          {successMessage}
        </div>
      )}



      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee ID
            </label>

            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
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
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              required
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
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
              value={formData.maritalStatus}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
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
              value={formData.designation}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              required
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salary
            </label>

            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              required
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              required
            >
              <option value="">Select Department</option>

              {departments.map((dep) => (
                <option key={dep._id} value={dep._id}>
                  {dep.dep_name}
                </option>
              ))}

            </select>
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>

          </div>


        </div>



        <div className="mt-6 flex justify-end">

          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md cursor-pointer transition duration-300 hover:scale-105 hover:shadow-lg"
          >
            Update Employee Detail
          </button>

        </div>


      </form>

    </div>
  );
};

export default Edit;

