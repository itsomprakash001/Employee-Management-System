import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const View = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);

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
          setEmployee(response.data.employee);
        }
      } catch (error) {
        alert(error.response?.data?.error || "Something went wrong");
      }
    };

    fetchEmployee();
  }, [id]);

  return (
    <>{employee ? (
    <div className="max-w-4xl mx-auto mt-6 bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-3xl font-bold text-center text-teal-600 mb-8">
        Employee Details
      </h2>

      
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Employee Image */}
  <div className="flex justify-center items-start">
    <img
      src={`http://localhost:3000/uploads/${employee?.userId?.profileImage}`}
      alt={employee?.userId?.name}
      className="w-40 h-40 rounded-lg object-cover border-2 border-teal-500 shadow-md"
    />
  </div>

  {/* Employee Details */}
  <div className="md:col-span-2">
    <div className="grid grid-cols-2 gap-y-4 text-[17px]">
      <p className="font-semibold text-gray-700">Name</p>
      <p className="text-gray-900">{employee?.userId?.name}</p>

      <p className="font-semibold text-gray-700">Employee ID</p>
      <p className="text-gray-900">{employee?.employeeId}</p>

      <p className="font-semibold text-gray-700">Email</p>
      <p className="text-gray-900">{employee?.userId?.email}</p>

      <p className="font-semibold text-gray-700">Date of Birth</p>
      <p className="text-gray-900">
        {employee?.dob
          ? new Date(employee.dob).toLocaleDateString()
          : ""}
      </p>

      <p className="font-semibold text-gray-700">Gender</p>
      <p className="text-gray-900">{employee?.gender}</p>

      <p className="font-semibold text-gray-700">Department</p>
      <p className="text-gray-900">{employee?.department?.dep_name}</p>

      <p className="font-semibold text-gray-700">Designation</p>
      <p className="text-gray-900">{employee?.designation}</p>

      <p className="font-semibold text-gray-700">Marital Status</p>
      <p className="text-gray-900">{employee?.maritalStatus}</p>
       
       {/* Salary */}
    <p className="font-semibold text-gray-700">Salary</p>
    <p className="text-gray-900">
      ₹{employee?.salary?.toLocaleString("en-IN")}
    </p>
      
    </div>
  </div>
</div>
    </div>
        ) : <div>Loading ...</div>}</> 
  );
};

export default View;