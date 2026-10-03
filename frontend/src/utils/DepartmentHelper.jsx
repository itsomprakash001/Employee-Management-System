import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import API_URL from "../api";

export const DepartmentButtons = ({
  DepId,
  onDepartmentDelete,
  canManage,
}) => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const handleDelete = async (id) => {
    if (!canManage) {
      alert("You are not authorized to delete departments.");
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.delete(
        `${API_URL}/api/department/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (onDepartmentDelete) {
          onDepartmentDelete(id);
        }

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
      console.log(
        "DELETE DEPARTMENT ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          "Something went wrong while deleting department"
      );
    }
  };

  if (!canManage) {
    return null;
  }

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
          navigate(
            `/admin-dashboard/departments/edit/${DepId}`
          )
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