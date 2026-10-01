import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        console.log(
          "FETCH EMPLOYEE ERROR:",
          error.response?.status,
          error.response?.data || error.message
        );

        alert(
          error.response?.data?.error ||
            "Something went wrong"
        );
      }
    };

    if (getToken && id) {
      fetchEmployee();
    }
  }, [id, getToken]);

  const handleDeleteEmployee = async () => {
    const employeeName =
      employee?.userId?.name || "this employee";

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${employeeName}?\n\n` +
        "This will delete the employee, login account, salary records, leave records, and profile image.\n\n" +
        "This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const token = await getToken();

      if (!token) {
        alert("Authentication token not found.");
        return;
      }

      const response = await axios.delete(
        `${API_URL}/api/employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Employee deleted successfully.");

        navigate("/admin-dashboard/employees");
      } else {
        alert(
          response.data.error ||
            "Failed to delete employee."
        );
      }
    } catch (error) {
      console.log(
        "DELETE EMPLOYEE ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Something went wrong while deleting the employee."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!employee) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading ...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white shadow-lg rounded-lg p-6">

      <h2 className="text-3xl font-bold text-center text-teal-600 mb-8">
        Employee Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="flex justify-center items-start">
          <img
            src={
              employee?.userId?.profileImage ||
              "https://via.placeholder.com/160"
            }
            alt={
              employee?.userId?.name ||
              "Employee"
            }
            className="w-40 h-40 rounded-lg object-cover border-2 border-teal-500 shadow-md"
          />
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-y-4 text-[17px]">

            <p className="font-semibold text-gray-700">
              Name
            </p>
            <p className="text-gray-900">
              {employee?.userId?.name}
            </p>

            <p className="font-semibold text-gray-700">
              Employee ID
            </p>
            <p className="text-gray-900">
              {employee?.employeeId}
            </p>

            <p className="font-semibold text-gray-700">
              Email
            </p>
            <p className="text-gray-900">
              {employee?.userId?.email}
            </p>

            <p className="font-semibold text-gray-700">
              Date of Birth
            </p>
            <p className="text-gray-900">
              {employee?.dob
                ? new Date(
                    employee.dob
                  ).toLocaleDateString("en-GB")
                : ""}
            </p>

            <p className="font-semibold text-gray-700">
              Gender
            </p>
            <p className="text-gray-900">
              {employee?.gender}
            </p>

            <p className="font-semibold text-gray-700">
              Department
            </p>
            <p className="text-gray-900">
              {employee?.department?.dep_name}
            </p>

            <p className="font-semibold text-gray-700">
              Designation
            </p>
            <p className="text-gray-900">
              {employee?.designation}
            </p>

            <p className="font-semibold text-gray-700">
              Marital Status
            </p>
            <p className="text-gray-900">
              {employee?.maritalStatus}
            </p>

            <p className="font-semibold text-gray-700">
              Salary
            </p>
            <p className="text-gray-900 font-semibold">
              ₹
              {Number(
                employee?.salary || 0
              ).toLocaleString("en-IN")}
            </p>

          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
        <button
          type="button"
          onClick={handleDeleteEmployee}
          disabled={deleting}
          className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting
            ? "Deleting..."
            : "Delete Employee"}
        </button>
      </div>

    </div>
  );
};

export default View;