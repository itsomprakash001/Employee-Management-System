
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditSalary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isPaid, setIsPaid] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    basicSalary: "",
    allowances: "",
    deductions: "",
    netSalary: "",
    payDate: "",
    status: "",
  });

  useEffect(() => {
    fetchSalary();
  }, []);

  const fetchSalary = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/salary/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const salary = response.data.salary;

        if (salary.status === "Paid") {
          setIsPaid(true);
        }

        setFormData({
          basicSalary: salary.basicSalary,
          allowances: salary.allowances,
          deductions: salary.deductions,
          netSalary: salary.netSalary,
          payDate: salary.payDate.split("T")[0],
          status: salary.status,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    if (isPaid) return;

    const { name, value } = e.target;

    const updated = {
      ...formData,
      [name]: value,
    };

    const basic = Number(updated.basicSalary) || 0;
    const allowance = Number(updated.allowances) || 0;
    const deduction = Number(updated.deductions) || 0;

    updated.netSalary = basic + allowance - deduction;

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPaid) {
      alert("Salary is already paid. You cannot update it.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/api/salary/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Salary Updated Successfully!");

        setTimeout(() => {
          navigate("/admin-dashboard/salary");
        }, 2000);
      }

    } catch (error) {
      console.log(error);
      alert("Update Failed");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">

        <div className="bg-teal-600 p-4">
          <h2 className="text-white text-xl font-bold">
            Edit Salary
          </h2>
        </div>


        <form onSubmit={handleSubmit} className="p-5">


          {successMessage && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center font-semibold">
              {successMessage}
            </div>
          )}


          {isPaid && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              This salary is already paid. You cannot edit it.
            </div>
          )}


          <div className="grid grid-cols-2 gap-4">


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
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />
            </div>


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
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />
            </div>


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
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />
            </div>


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
                className="w-full border rounded-md p-2 disabled:bg-gray-200"
              />
            </div>


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
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>


          </div>


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
              {isPaid ? "Already Paid" : "Update Salary"}
            </button>

          </div>


        </form>

      </div>

    </div>
  );
};

export default EditSalary;

