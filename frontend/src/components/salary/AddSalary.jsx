
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddSalary = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
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
      try {
        const response = await axios.get(
          "http://localhost:3000/api/employee",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          setEmployees(response.data.employees);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...formData,
      [name]: value,
    };

    const basic = Number(updatedForm.basicSalary) || 0;
    const allowance = Number(updatedForm.allowances) || 0;
    const deduction = Number(updatedForm.deductions) || 0;

    updatedForm.netSalary = basic + allowance - deduction;

    setFormData(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/salary/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Salary Added Successfully!");

        setTimeout(() => {
          navigate("/admin-dashboard/salary");
        }, 2000);
      }

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.error || "Failed to add salary"
      );
    }
  };

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
                  <label className="block text-sm font-semibold mb-1">
                    Employee
                  </label>

                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.employeeId} - {emp.name}
                      </option>
                    ))}

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Basic Salary
                  </label>

                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Allowances
                  </label>

                  <input
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Deductions
                  </label>

                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Net Salary
                  </label>

                  <input
                    type="number"
                    value={formData.netSalary}
                    readOnly
                    className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Pay Date
                  </label>

                  <input
                    type="date"
                    name="payDate"
                    value={formData.payDate}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Status
                  </label>

                  <select
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
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 hover:scale-105 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer text-white font-semibold text-sm px-7 py-2 rounded-lg"
                >
                  Add Salary
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

