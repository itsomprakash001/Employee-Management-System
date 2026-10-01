import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import API_URL from "../api";

const roleHierarchy = {
  admin: 5,
  manager: 4,
  hr: 3,
  tl: 2,
  employee: 1,
};

const canManageRole = (
  actorRole,
  targetRole
) => {
  const actorLevel =
    roleHierarchy[actorRole];

  const targetLevel =
    roleHierarchy[targetRole];

  if (
    actorLevel === undefined ||
    targetLevel === undefined
  ) {
    return false;
  }

  return actorLevel > targetLevel;
};

export const columns = [
  {
    name: "S.No",
    selector: (row) => row.sno,
    width: "55px",
    center: true,
  },

  {
    name: "ID",
    selector: (row) => row.employeeId,
    sortable: true,
    width: "95px",
  },

  {
    name: "Employee",
    cell: (row) => (
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={
            row.profileImage ||
            "https://via.placeholder.com/40"
          }
          alt={row.name || "Employee"}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
        />

        <span className="font-medium text-gray-800 truncate">
          {row.name}
        </span>
      </div>
    ),
    sortable: true,
    minWidth: "150px",
  },

  {
    name: "Department",
    selector: (row) => row.dep_name,
    sortable: true,
    minWidth: "110px",
  },

  {
    name: "Designation",
    selector: (row) => row.designation,
    sortable: true,
    minWidth: "110px",
  },

  {
    name: "Salary",
    cell: (row) => (
      <span className="font-medium text-gray-700">
        ₹
        {Number(
          row.salary || 0
        ).toLocaleString("en-IN")}
      </span>
    ),
    sortable: true,
    width: "100px",
  },

  {
    name: "Actions",
    cell: (row) => (
      <EmployeeButtons row={row} />
    ),
    center: true,
    minWidth: "255px",
  },
];

export const fetchDepartments = async (
  getToken
) => {
  let departments = [];

  try {
    if (
      typeof getToken !== "function"
    ) {
      console.error(
        "fetchDepartments: getToken is not a function",
        getToken
      );

      return departments;
    }

    const token =
      await getToken();

    if (!token) {
      console.log(
        "CLERK TOKEN NOT FOUND"
      );

      return departments;
    }

    const response =
      await axios.get(
        `${API_URL}/api/department`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (
      response.data.success
    ) {
      departments =
        response.data.departments ||
        [];
    }
  } catch (error) {
    console.log(
      "FETCH DEPARTMENTS ERROR:",
      error.response?.status,
      error.response?.data ||
        error.message
    );
  }

  return departments;
};

export const fetchEmployees = async (
  getToken
) => {
  let employees = [];

  try {
    if (
      typeof getToken !== "function"
    ) {
      console.error(
        "fetchEmployees: getToken is not a function",
        getToken
      );

      return employees;
    }

    const token =
      await getToken();

    if (!token) {
      console.log(
        "CLERK TOKEN NOT FOUND"
      );

      return employees;
    }

    const response =
      await axios.get(
        `${API_URL}/api/employee`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (
      response.data.success
    ) {
      employees =
        response.data.employees ||
        [];
    }
  } catch (error) {
    console.log(
      "FETCH EMPLOYEES ERROR:",
      error.response?.status,
      error.response?.data ||
        error.message
    );
  }

  return employees;
};

export const EmployeeButtons = ({
  row,
}) => {
  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const actorRole =
    user?.role;

  const targetRole =
    row?.role;

  const isSelf =
    user?._id &&
    row?.userId &&
    user._id === row.userId;

  const canManage =
    !isSelf &&
    canManageRole(
      actorRole,
      targetRole
    );

  // Employee can view own record.
  // Higher roles can view lower roles.
  const canView =
    isSelf ||
    canManage;

  if (!canView) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() =>
          navigate(
            `/admin-dashboard/employee/${row._id}`
          )
        }
        className="
          px-2.5 py-1
          bg-teal-50 text-teal-700
          border border-teal-200
          rounded
          text-xs font-medium
          hover:bg-teal-600 hover:text-white
          transition cursor-pointer
        "
      >
        View
      </button>

      {canManage && (
        <>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin-dashboard/employees/edit/${row._id}`
              )
            }
            className="
              px-2.5 py-1
              bg-blue-50 text-blue-700
              border border-blue-200
              rounded
              text-xs font-medium
              hover:bg-blue-600 hover:text-white
              transition cursor-pointer
            "
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin-dashboard/salary-history/${row._id}`
              )
            }
            className="
              px-2.5 py-1
              bg-purple-50 text-purple-700
              border border-purple-200
              rounded
              text-xs font-medium
              hover:bg-purple-600 hover:text-white
              transition cursor-pointer
            "
          >
            Salary
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin-dashboard/employee-leaves/${row._id}`
              )
            }
            className="
              px-2.5 py-1
              bg-orange-50 text-orange-700
              border border-orange-200
              rounded
              text-xs font-medium
              hover:bg-orange-500 hover:text-white
              transition cursor-pointer
            "
          >
            Leave
          </button>
        </>
      )}
    </div>
  );
};