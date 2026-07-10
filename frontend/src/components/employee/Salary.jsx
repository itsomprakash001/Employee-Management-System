import React, { useEffect, useState } from "react";
import axios from "axios";

const Salary = () => {
const [salaries, setSalaries] = useState([]);
useEffect(() => {
const fetchSalary = async () => {
try {
   const employeeId = localStorage.getItem("employeeId");
  const response = await axios.get(
          `http://localhost:3000/api/salary/employee/${employeeId}`,
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

        console.log(error);

      }

    };


    fetchSalary();

  }, []);
return (
  <div className="p-6 bg-gray-100 min-h-screen">
   <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-teal-700 mb-6">
          My Salary Details
        </h2>
   {
          salaries.length > 0 ? (
   <div className="space-y-5">

    {
                salaries.map((salary)=>(
      <div
                    key={salary._id}
                    className="
                    bg-white
                    rounded-xl
                    shadow-md
                    p-6
                    border
                    hover:shadow-xl
                    transition-all
                    duration-300
                    "
                  >


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                      <p>
                        <b>Employee ID:</b>{" "}
                        {salary.employeeId?.employeeId}
                      </p>


                      <p>
                        <b>Name:</b>{" "}
                        {salary.employeeId?.userId?.name}
                      </p>


                      <p>
                        <b>Basic Salary:</b>{" "}
                        ₹ {salary.basicSalary}
                      </p>


                      <p>
                        <b>Allowances:</b>{" "}
                        ₹ {salary.allowances}
                      </p>


                      <p>
                        <b>Deductions:</b>{" "}
                        ₹ {salary.deductions}
                      </p>


                      <p>
                        <b>Net Salary:</b>{" "}
                        ₹ {salary.netSalary}
                      </p>


                      <p>
                        <b>Pay Date:</b>{" "}
                        {
                          new Date(
                            salary.payDate
                          ).toDateString()
                        }
                      </p>


                      <p>
                        <b>Status:</b>

                        <span
                          className="
                          ml-2
                          px-3
                          py-1
                          rounded-full
                          bg-green-100
                          text-green-700
                          "
                        >
                          Paid
                        </span>

                      </p>
             </div>


                  </div>
         ))
              }


            </div>


          ) : (

            <div className="bg-white p-6 rounded-lg shadow">

              <p className="text-gray-500">
                No salary records found.
              </p>

            </div>

          )
        }
</div>
</div>

  );

};

export default Salary;