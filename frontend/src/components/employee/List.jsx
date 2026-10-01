import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { columns } from "../../utils/EmployeeHelper";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const List = () => {
  const { user, getToken } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] =
    useState([]);
  const [empLoading, setEmpLoading] = useState(false);

  useEffect(() => {
    if (getToken && user) {
      fetchEmployees();
    }
  }, [getToken, user]);

  const fetchEmployees = async () => {
    setEmpLoading(true);

    try {
      const token = await getToken();

      if (!token) {
        console.log("CLERK TOKEN NOT FOUND");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/employee`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const data =
          response.data.employees.map(
            (emp, index) => ({
              _id: emp._id,

              sno: index + 1,

              employeeId: emp.employeeId,

              name: emp.name,

              email: emp.email,

              role: emp.role,

              dep_name: emp.dep_name,

              designation: emp.designation,

              dob: emp.dob
                ? new Date(
                    emp.dob
                  ).toLocaleDateString(
                    "en-GB"
                  )
                : "",

              salary: emp.salary,

              profileImage:
                emp.profileImage,
            })
          );

        setEmployees(data);
        setFilteredEmployees(data);
      }
    } catch (error) {
      console.log(
        "FETCH EMPLOYEES ERROR:",
        error.response?.status,
        error.response?.data ||
          error.message
      );

      if (error.response) {
        alert(
          error.response.data.error ||
            "Unable to fetch employees"
        );
      } else {
        alert("Something went wrong");
      }
    } finally {
      setEmpLoading(false);
    }
  };

  const handleFilter = (e) => {
    const value =
      e.target.value.toLowerCase();

    const records = employees.filter(
      (emp) =>
        emp.name
          ?.toLowerCase()
          .includes(value) ||
        emp.employeeId
          ?.toLowerCase()
          .includes(value) ||
        emp.email
          ?.toLowerCase()
          .includes(value)
    );

    setFilteredEmployees(records);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "CEO";

      case "manager":
        return "Manager";

      case "hr":
        return "HR";

      case "tl":
        return "Team Leader";

      case "employee":
        return "Employee";

      default:
        return role || "";
    }
  };

  const canAddUser =
    user?.role === "admin" ||
    user?.role === "manager" ||
    user?.role === "hr" ||
    user?.role === "tl";

  return (
    <div className="p-6 w-full">

      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold">
          Manage Employee
        </h2>

        {user?.role && (
          <p className="mt-2 text-gray-500">
            Logged in as{" "}
            <span className="font-semibold">
              {getRoleLabel(user.role)}
            </span>
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">

        <input
          type="text"
          placeholder="Search By Name, ID or Email"
          onChange={handleFilter}
          className="w-72 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
        />

        {canAddUser && (
          <Link
            to="/admin-dashboard/add-employee"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition"
          >
            Add New User
          </Link>
        )}
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