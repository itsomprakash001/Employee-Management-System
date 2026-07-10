import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { columns } from "../../utils/EmployeeHelper";

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setEmpLoading(true);

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
        const data = response.data.employees.map((emp, index) => ({
          _id: emp._id,
          sno: index + 1,
          name: emp.name,
          dep_name: emp.dep_name,
          dob: new Date(emp.dob).toLocaleDateString("en-GB"),
          salary: emp.salary,
          profileImage: emp.profileImage,
        }));

        setEmployees(data);
        setFilteredEmployees(data);
      }
    } catch (error) {
      console.log(error);

      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("Something went wrong");
      }
    } finally {
      setEmpLoading(false);
    }
  };

  // Search Employee
  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();

    const records = employees.filter((emp) =>
      emp.name.toLowerCase().includes(value)
    );

    setFilteredEmployees(records);
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold">Manage Employee</h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search By Employee Name"
          onChange={handleFilter}
          className="w-72 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
        />

        <Link
          to="/admin-dashboard/add-employee"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition"
        >
          Add New Employee
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredEmployees}
          progressPending={empLoading}
          pagination
          highlightOnHover
          responsive
          striped
          persistTableHead
        />
      </div>
    </div>
  );
};

export default List;