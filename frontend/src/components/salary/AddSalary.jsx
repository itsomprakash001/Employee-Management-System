import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

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

const AddSalary = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    netSalary: "",
    payDate: "",
    status: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user || user.role === "employee") {
        return;
      }

      try {
        setLoadingEmployees(true);

        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/employee`,
          {
            params: {
              page: 1,
              limit: 100,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const accessibleEmployees = (
            response.data.employees || []
          ).filter((employee) =>
            canManageRole(
              user.role,
              employee.role
            )
          );

          setEmployees(accessibleEmployees);
        }
      } catch (error) {
        console.log(
          "FETCH EMPLOYEES ERROR:",
          error.response?.status,
          error.response?.data || error.message
        );

        alert(
          error.response?.data?.error ||
            "Failed to fetch employees"
        );
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (getToken && user) {
      fetchEmployees();
    }
  }, [getToken, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = {
        ...prev,
        [name]: value,
      };

      const basic = Number(updatedForm.basicSalary) || 0;
      const allowance =
        Number(updatedForm.allowances) || 0;
      const deduction =
        Number(updatedForm.deductions) || 0;

      updatedForm.netSalary =
        basic + allowance - deduction;

      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !user ||
      !["admin", "manager", "hr", "tl"].includes(
        user.role
      )
    ) {
      alert("You are not allowed to add salary.");
      return;
    }

    const selectedEmployee = employees.find(
      (employee) =>
        employee._id === formData.employeeId
    );

    if (!selectedEmployee) {
      alert("Please select a valid employee.");
      return;
    }

    if (
      !canManageRole(
        user.role,
        selectedEmployee.role
      )
    ) {
      alert(
        "You are not allowed to manage this employee's salary."
      );
      return;
    }

    const basicSalary = Number(
      formData.basicSalary
    );

    const allowances = Number(
      formData.allowances || 0
    );

    const deductions = Number(
      formData.deductions || 0
    );

    const netSalary =
      basicSalary + allowances - deductions;

    if (
      !Number.isFinite(basicSalary) ||
      basicSalary < 0
    ) {
      alert("Please enter a valid basic salary.");
      return;
    }

    if (
      !Number.isFinite(allowances) ||
      allowances < 0
    ) {
      alert("Please enter valid allowances.");
      return;
    }

    if (
      !Number.isFinite(deductions) ||
      deductions < 0
    ) {
      alert("Please enter valid deductions.");
      return;
    }

    if (netSalary < 0) {
      alert(
        "Deductions cannot be greater than the total salary."
      );
      return;
    }

    if (!formData.payDate) {
      alert("Pay date is required.");
      return;
    }

    if (
      !["Paid", "Pending"].includes(
        formData.status
      )
    ) {
      alert("Please select a valid salary status.");
      return;
    }

    try {
      setSubmitting(true);

      const token = await getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/salary/add`,
        {
          employeeId: formData.employeeId,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          payDate: formData.payDate,
          status: formData.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage(
          "Salary Added Successfully!"
        );

        setTimeout(() => {
          navigate("/admin-dashboard/salary");
        }, 1500);
      }
    } catch (error) {
      console.log(
        "ADD SALARY ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Failed to add salary"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canAddSalary =
    user &&
    ["admin", "manager", "hr", "tl"].includes(
      user.role
    );

  if (!canAddSalary) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600">
            You are not allowed to add salary records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-3 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-3">
            <h2 className="text-xl font-bold text-white">
              Add Salary
            </h2>

            <p className="text-teal-100 text-xs">
              Create employee salary record
            </p>
          </div>

          <div className="p-4">
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 font-semibold text-center">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="employeeId"
                    className="block text-sm font-semibold mb-1"
                  >
                    Employee
                  </label>

                  <select
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                    disabled={loadingEmployees}
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingEmployees
                        ? "Loading employees..."
                        : "Select Employee"}
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee._id}
                        value={employee._id}
                      >
                        {employee.employeeId} -{" "}
                        {employee.name} (
                        {employee.role})
                      </option>
                    ))}
                  </select>

                  {!loadingEmployees &&
                    employees.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No employees available for your role.
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="basicSalary"
                    className="block text-sm font-semibold mb-1"
                  >
                    Basic Salary
                  </label>

                  <input
                    id="basicSalary"
                    name="basicSalary"
                    type="number"
                    value={formData.basicSalary}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="allowances"
                    className="block text-sm font-semibold mb-1"
                  >
                    Allowances
                  </label>

                  <input
                    id="allowances"
                    name="allowances"
                    type="number"
                    value={formData.allowances}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="deductions"
                    className="block text-sm font-semibold mb-1"
                  >
                    Deductions
                  </label>

                  <input
                    id="deductions"
                    name="deductions"
                    type="number"
                    value={formData.deductions}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="netSalary"
                    className="block text-sm font-semibold mb-1"
                  >
                    Net Salary
                  </label>

                  <input
                    id="netSalary"
                    name="netSalary"
                    type="number"
                    value={formData.netSalary}
                    readOnly
                    className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payDate"
                    className="block text-sm font-semibold mb-1"
                  >
                    Pay Date
                  </label>

                  <input
                    id="payDate"
                    name="payDate"
                    type="date"
                    value={formData.payDate}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="status"
                    className="block text-sm font-semibold mb-1"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">
                      Select Status
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Pending">
                      Pending
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  id="add-salary"
                  type="submit"
                  disabled={
                    submitting ||
                    loadingEmployees ||
                    employees.length === 0
                  }
                  className="bg-teal-600 hover:bg-teal-700 hover:scale-105 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer text-white font-semibold text-sm px-7 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                >
                  {submitting
                    ? "Adding..."
                    : "Add Salary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSalary;