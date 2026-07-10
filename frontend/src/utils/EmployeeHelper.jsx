import axios from "axios";
import { useNavigate } from "react-router-dom";


export const columns = [
  {
    name: "S No",
    selector: row => row.sno,
    width: "70px",
  },
  {
    name: "Name",
    selector: row => row.name,
    sortable: true,
    width: "140px",      // reduced
    wrap: true,
  },
  {
    name: "Image",
    cell: row => (
      <img
  src={`http://localhost:3000/uploads/${row.profileImage}`}
  alt={row.name}
  className="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
/>
    ),
    width: "120px",
  },
  {
  name: (
    <div className="w-full text-center">
      Department
    </div>
  ),
  selector: (row) => row.dep_name,
  
  width: "120px",
  center: true,
},
  {
  name: <div className="w-full text-center">DOB</div>,
  selector: (row) => row.dob,
  sortable: true,
  width: "180px",
  center: true,
},
  {
  name: <div className="w-full text-center">Action</div>,
  cell: (row) => <EmployeeButtons Id={row._id} />,
  center: true,
}
];


export const fetchDepartments = async () => {
  let departments = [];

  try {
    const response = await axios.get(
      "http://localhost:3000/api/department",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.success) {
      departments = response.data.departments;
    }
  } catch (error) {
    console.log(error);
  }

  return departments;
};



export const fetchEmployees = async () => {
  let employees = [];

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
      employees = response.data.employees;
    }
  } catch (error) {
    console.log(error);
  }

  return employees;
};



export const EmployeeButtons = ({ Id }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 justify-center">
  <button
    className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md
    hover:bg-teal-700 hover:shadow-lg hover:scale-105
    transition-all duration-200 cursor-pointer"
    onClick={() => navigate(`/admin-dashboard/employee/${Id}`)}
  >
    View
  </button>

  <button
    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md
    hover:bg-blue-700 hover:shadow-lg hover:scale-105
    transition-all duration-200 cursor-pointer"
    onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
  >
    Edit
  </button>

  <button
  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md
  hover:bg-yellow-600 hover:shadow-lg hover:scale-105
  transition-all duration-200 cursor-pointer"
  onClick={() =>
    navigate(`/admin-dashboard/salary-history/${Id}`)
  }
>
  Salary
</button>

  <button
  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md
  hover:bg-red-700 hover:shadow-lg hover:scale-105
  transition-all duration-200 cursor-pointer"
  onClick={() =>
    navigate(`/admin-dashboard/employee-leaves/${Id}`)
  }
>
  Leave
</button>
</div>
    
  );
};