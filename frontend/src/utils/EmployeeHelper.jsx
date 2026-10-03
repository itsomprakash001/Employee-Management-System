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

const getRoleBadgeClass = (role) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700 border-purple-200";

    case "manager":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "hr":
      return "bg-pink-100 text-pink-700 border-pink-200";

    case "tl":
      return "bg-orange-100 text-orange-700 border-orange-200";

    case "employee":
      return "bg-gray-100 text-gray-700 border-gray-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const columns = [
  {
    name: "S.No",
    selector: (row) => row.sno,
    width: "65px",
    center: true,
  },

  {
    name: "ID",
    selector: (row) => row.employeeId,
    sortable: true,
    width: "100px",
  },

  {
    name: "Employee",
    cell: (row) => (
      <div className="flex items-center gap-3 min-w-0 py-1">
        <img
          src={
            row.profileImage ||
            "https://via.placeholder.com/40"
          }
          alt={row.name || "Employee"}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
        />

        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {row.name || "N/A"}
          </p>

          <p className="text-xs text-gray-500 truncate">
            {row.email || ""}
          </p>
        </div>
      </div>
    ),
    sortable: true,
    minWidth: "230px",
  },

  {
    name: "Role",
    cell: (row) => (
      <span
        className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getRoleBadgeClass(
          row.role
        )}`}
      >
        {getRoleLabel(row.role)}
      </span>
    ),
    sortable: true,
    width: "125px",
    center: true,
  },

  {
    name: "Department",
    selector: (row) =>
      row.dep_name || "Not Assigned",
    sortable: true,
    minWidth: "130px",
  },

  {
    name: "Designation",
    selector: (row) =>
      row.designation || "N/A",
    sortable: true,
    minWidth: "130px",
  },

  {
    name: "Salary",
    cell: (row) => (
      <span className="font-semibold text-gray-700">
        ₹
        {Number(
          row.salary || 0
        ).toLocaleString("en-IN")}
      </span>
    ),
    sortable: true,
    width: "120px",
  },

  {
    name: "Actions",
    cell: (row) => (
      <EmployeeButtons row={row} />
    ),
    center: true,
    minWidth: "280px",
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
  getToken,
  options = {}
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

    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      department = "",
    } = options;

    const response =
      await axios.get(
        `${API_URL}/api/employee`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          params: {
            page,
            limit,
            ...(search.trim()
              ? {
                  search:
                    search.trim(),
                }
              : {}),
            ...(role
              ? {
                  role,
                }
              : {}),
            ...(department
              ? {
                  department,
                }
              : {}),
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

  const canView =
    isSelf ||
    canManage;

  if (!canView) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 py-1">
      <button
        type="button"
        onClick={() =>
          navigate(
            `/admin-dashboard/employee/${row._id}`
          )
        }
        className="
          px-2.5 py-1.5
          bg-teal-50 text-teal-700
          border border-teal-200
          rounded-md
          text-xs font-semibold
          hover:bg-teal-600 hover:text-white
          transition
          cursor-pointer
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
              px-2.5 py-1.5
              bg-blue-50 text-blue-700
              border border-blue-200
              rounded-md
              text-xs font-semibold
              hover:bg-blue-600 hover:text-white
              transition
              cursor-pointer
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
              px-2.5 py-1.5
              bg-purple-50 text-purple-700
              border border-purple-200
              rounded-md
              text-xs font-semibold
              hover:bg-purple-600 hover:text-white
              transition
              cursor-pointer
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
              px-2.5 py-1.5
              bg-orange-50 text-orange-700
              border border-orange-200
              rounded-md
              text-xs font-semibold
              hover:bg-orange-500 hover:text-white
              transition
              cursor-pointer
            "
          >
            Leave
          </button>
        </>
      )}
    </div>
  );
};