import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SalaryManagement = () => {

  const navigate = useNavigate();

  const [salaries, setSalaries] = useState([]);


  const fetchSalaries = async () => {

    try {

      const response = await axios.get(
        "http://localhost:3000/api/salary",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      if (response.data.success) {

        setSalaries(response.data.salaries);

      }


    } catch (error) {

      console.log("FETCH SALARY ERROR:", error);

    }

  };



  useEffect(() => {

    fetchSalaries();

  }, []);




  return (

    <div className="p-6">


      <div className="flex justify-between items-center mb-6">


        <h2 className="text-3xl font-bold text-teal-700">
          Salary Management
        </h2>



        <button
          onClick={() => navigate("/admin-dashboard/add-salary")}
          className="bg-teal-600 text-white px-6 py-3 rounded-md"
        >
          Add Salary
        </button>


      </div>





      <div className="bg-white shadow rounded-lg overflow-x-auto">


        <table className="w-full">


          <thead className="bg-teal-600 text-white">

            <tr>

              <th className="p-3">
                Employee ID
              </th>

              <th className="p-3">
                Employee Name
              </th>

              <th className="p-3">
                Department
              </th>

              <th className="p-3">
                Basic Salary
              </th>

              <th className="p-3">
                Allowances
              </th>

              <th className="p-3">
                Deductions
              </th>

              <th className="p-3">
                Net Salary
              </th>

              <th className="p-3">
                Pay Date
              </th>

              <th className="p-3">
                Status
              </th>


            </tr>


          </thead>




          <tbody>


            {salaries.length > 0 ? (

              salaries.map((salary) => (

                <tr 
                  key={salary._id}
                  className="border-b"
                >

                  <td className="p-3">
                    {salary.employeeId}
                  </td>


                  <td className="p-3">
                    {salary.employeeName}
                  </td>


                  <td className="p-3">
                    {salary.department}
                  </td>


                  <td className="p-3">
                    ₹{salary.basicSalary}
                  </td>


                  <td className="p-3">
                    ₹{salary.allowances}
                  </td>


                  <td className="p-3">
                    ₹{salary.deductions}
                  </td>


                  <td className="p-3 font-semibold">
                    ₹{salary.netSalary}
                  </td>


                  <td className="p-3">
                    {salary.payDate}
                  </td>


                  <td className="p-3">

                    <span
                      className={
                        salary.status === "Paid"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                      }
                    >

                      {salary.status}

                    </span>

                  </td>


                </tr>

              ))


            ) : (


              <tr>

                <td
                  colSpan="9"
                  className="text-center p-5"
                >

                  No Salary Found

                </td>

              </tr>


            )}


          </tbody>



        </table>


      </div>


    </div>

  );

};


export default SalaryManagement;   