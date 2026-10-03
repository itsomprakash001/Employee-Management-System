import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import { columns } from "../../utils/EmployeeHelper";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const roleHierarchy = {
  admin: 5,
  manager: 4,
  hr: 3,
  tl: 2,
  employee: 1,
};

const List = () => {
  const { user, getToken } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDepartments = async () => {
    try {
      const token = await getToken();

      if (!token) return;

      const response = await axios.get(
        `${API_URL}/api/department`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDepartments(response.data.departments || []);
      }
    } catch (error) {
      console.log(
        "FETCH DEPARTMENTS ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmpLoading(true);

      const token = await getToken();

      if (!token) {
        console.log("CLERK TOKEN NOT FOUND");
        return;
      }

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (departmentFilter) {
        params.department = departmentFilter;
      }

      const response = await axios.get(
        `${API_URL}/api/employee`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      if (response.data.success) {
        const employeeData = response.data.employees || [];

        const data = employeeData.map((emp, index) => ({
          _id: emp._id,
          userId: emp.userId,
          sno: (page - 1) * limit + index + 1,
          employeeId: emp.employeeId,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          dep_name: emp.dep_name,
          designation: emp.designation,
          dob: emp.dob
            ? new Date(emp.dob).toLocaleDateString("en-IN")
            : "N/A",
          salary: emp.salary,
          profileImage: emp.profileImage,
        }));

        setEmployees(data);
        setTotalRows(response.data.pagination?.total || 0);
        setTotalPages(
          response.data.pagination?.totalPages || 0
        );
      }
    } catch (error) {
      console.log(
        "FETCH EMPLOYEES ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Something went wrong while fetching employees"
      );
    } finally {
      setEmpLoading(false);
    }
  };

  useEffect(() => {
    if (getToken) {
      fetchDepartments();
    }
  }, [getToken]);

  useEffect(() => {
    if (getToken) {
      fetchEmployees();
    }
  }, [
    getToken,
    page,
    limit,
    search,
    roleFilter,
    departmentFilter,
  ]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newLimit, newPage) => {
    setLimit(newLimit);
    setPage(newPage);
  };

  const availableRoles = Object.keys(roleHierarchy).filter(
    (role) => {
      if (!user?.role) return false;

      const actorLevel = roleHierarchy[user.role];
      const targetLevel = roleHierarchy[role];

      return (
        targetLevel !== undefined &&
        actorLevel !== undefined &&
        actorLevel >= targetLevel
      );
    }
  );

  const canAddEmployee =
    user &&
    ["admin", "manager", "hr", "tl"].includes(user.role);

  return (
    <div className="min-h-full bg-gray-50 p-5">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-black">
          Employee Management
        </h1>

        <p className="text-lg text-gray-500 mt-1">
          Logged in as{" "}
          <span className="font-medium text-gray-600">
            {user?.role === "admin" ? "CEO" : user?.role}
          </span>
        </p>
      </div>

      <div className="flex gap-3 mb-5 items-center">
        <input
          type="text"
          placeholder="Search By Name, ID or Email"
          value={search}
          onChange={handleSearch}
          className="
            flex-1
            px-4
            py-2.5
            border
            border-gray-300
            rounded-lg
            text-base
            outline-none
            bg-white
            focus:ring-2
            focus:ring-teal-500
          "
        />

        <select
          value={roleFilter}
          onChange={handleRoleChange}
          className="
            w-56
            px-4
            py-2.5
            border
            border-gray-300
            rounded-lg
            text-base
            outline-none
            bg-white
            focus:ring-2
            focus:ring-teal-500
          "
        >
          <option value="">All Roles</option>

          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={handleDepartmentChange}
          className="
            w-56
            px-4
            py-2.5
            border
            border-gray-300
            rounded-lg
            text-base
            outline-none
            bg-white
            focus:ring-2
            focus:ring-teal-500
          "
        >
          <option value="">All Departments</option>

          {departments.map((department) => (
            <option
              key={department._id}
              value={department._id}
            >
              {department.dep_name}
            </option>
          ))}
        </select>

        {canAddEmployee && (
          <Link
            to="/admin-dashboard/add-employee"
            className="
              px-5
              py-2.5
              bg-teal-600
              text-white
              rounded-lg
              font-medium
              whitespace-nowrap
              hover:bg-teal-700
              transition
            "
          >
            + Add Employee
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={employees}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationDefaultPage={page}
          paginationPerPage={limit}
          paginationRowsPerPageOptions={[
            5,
            10,
            20,
            50,
            100,
          ]}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          progressPending={empLoading}
          progressComponent={
            <div className="py-10 text-base text-gray-500">
              Loading employees...
            </div>
          }
          noDataComponent={
            <div className="py-10 text-base text-gray-500">
              No employees found
            </div>
          }
          customStyles={{
            headCells: {
              style: {
                fontSize: "14px",
                fontWeight: "600",
                paddingTop: "12px",
                paddingBottom: "12px",
              },
            },
            cells: {
              style: {
                fontSize: "14px",
                paddingTop: "10px",
                paddingBottom: "10px",
              },
            },
          }}
        />
      </div>

      {totalRows > 0 && (
        <div className="text-center mt-3 text-sm text-gray-500">
          Page {page} of {totalPages} · {totalRows} employees
        </div>
      )}
    </div>
  );
};

export default List;