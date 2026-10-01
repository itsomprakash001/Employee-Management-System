import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const roleHierarchy = {
  admin: 5,
  manager: 4,
  hr: 3,
  tl: 2,
  employee: 1,
};

const canManageRole = (actorRole, targetRole) => {
  const actorLevel = roleHierarchy[actorRole];
  const targetLevel = roleHierarchy[targetRole];

  if (
    actorLevel === undefined ||
    targetLevel === undefined
  ) {
    return false;
  }

  return actorLevel > targetLevel;
};

const EditSalary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();

  const [isPaid, setIsPaid] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [accessDenied, setAccessDenied] =
    useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    basicSalary: "",
    allowances: "",
    deductions: "",
    netSalary: "",
    payDate: "",
    status: "",
  });

  

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        setLoading(true);

        const token = await getToken();

        if (!token) {
          alert(
            "Authentication token not found. Please login again."
          );
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/salary/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const salary = response.data.salary;

          // Employee role returned by backend
          const targetRole =
            salary.employeeRole ||
            salary.employeeId?.userId?.role ||
            salary.role ||
            "";

          // Frontend hierarchy check
          if (
            !user ||
            user.role === "employee" ||
            !canManageRole(
              user.role,
              targetRole
            )
          ) {
            setAccessDenied(true);
            return;
          }

          if (salary.status === "Paid") {
            setIsPaid(true);
          }

          setFormData({
            basicSalary:
              salary.basicSalary ?? "",
            allowances:
              salary.allowances ?? "",
            deductions:
              salary.deductions ?? "",
            netSalary:
              salary.netSalary ?? "",
            payDate: salary.payDate
              ? new Date(
                  salary.payDate
                )
                  .toISOString()
                  .split("T")[0]
              : "",
            status:
              salary.status || "Pending",
          });
        }
      } catch (error) {
        console.log(
          "FETCH SALARY ERROR:",
          error.response?.status,
          error.response?.data ||
            error.message
        );

        if (
          error.response?.status === 403 ||
          error.response?.status === 404
        ) {
          setAccessDenied(true);
        } else {
          alert(
            error.response?.data?.error ||
              "Failed to fetch salary details"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && user && getToken) {
      fetchSalary();
    }
  }, [id, user, getToken]);

  
  const handleChange = (e) => {
    if (isPaid) return;

    const { name, value } = e.target;

    const updated = {
      ...formData,
      [name]: value,
    };

    const basic =
      Number(updated.basicSalary) || 0;

    const allowance =
      Number(updated.allowances) || 0;

    const deduction =
      Number(updated.deductions) || 0;

    updated.netSalary =
      basic + allowance - deduction;

    setFormData(updated);
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role === "employee") {
      alert(
        "You are not allowed to update salary."
      );
      return;
    }

    if (isPaid) {
      alert(
        "Salary is already paid. You cannot update it."
      );
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/salary/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage(
          "Salary Updated Successfully!"
        );

        setTimeout(() => {
          navigate(
            "/admin-dashboard/salary"
          );
        }, 2000);
      }
    } catch (error) {
      console.log(
        "UPDATE SALARY ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.error ||
          "Failed to update salary"
      );
    }
  };

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 font-semibold">
          Loading salary details...
        </div>
      </div>
    );
  }

  // ================= ACCESS DENIED =================

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600 mb-5">
            You are not allowed to edit this salary record.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin-dashboard/salary"
              )
            }
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg"
          >
            Back to Salary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Header */}

        <div className="bg-teal-600 p-4">

          <h2 className="text-white text-xl font-bold">
            Edit Salary
          </h2>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5"
        >

          {/* Success Message */}

          {successMessage && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center font-semibold">
              {successMessage}
            </div>
          )}

          {/* Paid Message */}

          {isPaid && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              This salary is already paid. You cannot edit it.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Basic Salary */}

            <div>

              <label className="block mb-1 font-medium">
                Basic Salary
              </label>

              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleChange}
                disabled={isPaid}
                min="0"
                required
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />

            </div>

            {/* Allowances */}

            <div>

              <label className="block mb-1 font-medium">
                Allowances
              </label>

              <input
                type="number"
                name="allowances"
                value={formData.allowances}
                onChange={handleChange}
                disabled={isPaid}
                min="0"
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />

            </div>

            {/* Deductions */}

            <div>

              <label className="block mb-1 font-medium">
                Deductions
              </label>

              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                disabled={isPaid}
                min="0"
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />

            </div>

            {/* Net Salary */}

            <div>

              <label className="block mb-1 font-medium">
                Net Salary
              </label>

              <input
                type="number"
                value={formData.netSalary}
                readOnly
                className="w-full border rounded-md p-2 bg-gray-100"
              />

            </div>

            {/* Pay Date */}

            <div>

              <label className="block mb-1 font-medium">
                Pay Date
              </label>

              <input
                type="date"
                name="payDate"
                value={formData.payDate}
                onChange={handleChange}
                disabled={isPaid}
                required
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />

            </div>

            {/* Status */}

            <div>

              <label className="block mb-1 font-medium">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isPaid}
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="Paid">
                  Paid
                </option>

              </select>

            </div>

          </div>

          {/* Button */}

          <div className="flex justify-end mt-6">

            <button
              type="submit"
              disabled={isPaid}
              className={`px-6 py-2 rounded-lg text-white transition ${
                isPaid
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
              }`}
            >
              {isPaid
                ? "Already Paid"
                : "Update Salary"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditSalary;