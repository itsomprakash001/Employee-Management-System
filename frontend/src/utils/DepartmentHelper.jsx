import axios from "axios";
import { useNavigate } from "react-router-dom";

export const DepartmentButtons = ({ DepId }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await axios.delete(
        `${API_URL}/api/department/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const message = document.createElement("div");

        message.innerText = "Department deleted successfully!";
        message.className =
          "fixed top-5 right-5 bg-red-100 text-red-700 px-5 py-3 rounded-lg shadow-lg font-semibold z-50";

        document.body.appendChild(message);

        setTimeout(() => {
          message.remove();
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.error ||
          "Something went wrong"
      );
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        className="
          px-4 py-2
          bg-teal-600
          text-white
          rounded-md
          cursor-pointer
          hover:bg-teal-700
          hover:scale-105
          hover:shadow-lg
          transition-all
          duration-300
        "
        onClick={() =>
          navigate(`/admin-dashboard/departments/edit/${DepId}`)
        }
      >
        Edit
      </button>

      <button
        className="
          px-4 py-2
          bg-red-600
          text-white
          rounded-md
          cursor-pointer
          hover:bg-red-700
          hover:scale-105
          hover:shadow-lg
          transition-all
          duration-300
        "
        onClick={() => handleDelete(DepId)}
      >
        Delete
      </button>
    </div>
  );
};

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "80px",
  },
  {
    name: "Department Name",
    selector: (row) => row.dep_name,
    sortable: true,
  },
  {
    name: "Action",
    cell: (row) => row.action,
    center: true,
  },
];