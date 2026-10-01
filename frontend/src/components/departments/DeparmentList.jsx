import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { DepartmentButtons } from "../../utils/DepartmentHelper";
import { columns } from "../../utils/DepartmentColumns";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const DepartmentList = () => {
  const { user, getToken } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [filteredDepartment, setFilteredDepartments] = useState([]);

  const isAdmin = user?.role === "admin";

  const onDepartmentDelete = (id) => {
    const data = departments.filter((dep) => dep._id !== id);

    setDepartments(data);
    setFilteredDepartments(data);
  };

  useEffect(() => {
    if (!getToken) return;

    const fetchDepartments = async () => {
      setDepLoading(true);

      try {
        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/department`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          let sno = 1;

          const data = response.data.departments.map((dep) => ({
            _id: dep._id,
            sno: sno++,
            dep_name: dep.dep_name,
            action: (
              <DepartmentButtons
                DepId={dep._id}
                onDepartmentDelete={onDepartmentDelete}
                canManage={isAdmin}
              />
            ),
          }));

          setDepartments(data);
          setFilteredDepartments(data);
        }
      } catch (error) {
        console.log(
          "FETCH DEPARTMENTS ERROR:",
          error.response?.status,
          error.response?.data || error.message
        );

        alert(
          error.response?.data?.error ||
            "Something went wrong while fetching departments"
        );
      } finally {
        setDepLoading(false);
      }
    };

    fetchDepartments();
  }, [getToken, isAdmin]);

  const filterDepartments = (e) => {
    const records = departments.filter((dep) =>
      dep.dep_name
        .toLowerCase()
        .includes(e.target.value.toLowerCase())
    );

    setFilteredDepartments(records);
  };

  return (
    <>
      {depLoading ? (
        <div className="p-5">Loading ...</div>
      ) : (
        <div className="p-5">
          <div className="text-center">
            <h3 className="text-2xl font-bold">
              Manage Departments
            </h3>
          </div>

          <div className="flex justify-between items-center mt-5">
            <input
              type="text"
              placeholder="Search By Dep Name"
              className="px-4 py-2 border border-gray-300 rounded-md"
              onChange={filterDepartments}
            />

            {isAdmin && (
              <Link
                to="/admin-dashboard/add-department"
                className="px-4 py-2 bg-teal-600 rounded text-white hover:bg-teal-700"
              >
                Add New Department
              </Link>
            )}
          </div>

          <div className="mt-5">
            <DataTable
              columns={columns}
              data={filteredDepartment}
              pagination
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentList;