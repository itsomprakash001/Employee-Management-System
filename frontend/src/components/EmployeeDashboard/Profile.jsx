import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaBriefcase,
  FaMoneyBillWave,
  FaIdBadge,
  FaVenusMars,
  FaBirthdayCake,
  FaHeart,
} from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

const Profile = () => {
  const { getToken } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();

        if (!token) {
          console.log("CLERK TOKEN NOT FOUND");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/employee/profile/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "EMPLOYEE PROFILE RESPONSE:",
          response.data
        );

        if (response.data.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        console.log(
          "FETCH PROFILE ERROR:",
          error.response?.status,
          error.response?.data ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (getToken) {
      fetchProfile();
    }
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold">
          Loading...
        </h2>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-red-600">
          Unable to load profile
        </h2>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-teal-600 to-cyan-600"></div>

        <div className="px-10 pb-10">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-20">
            <img
              src={
                employee.profileImage ||
                "https://via.placeholder.com/160"
              }
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-lg bg-white"
            />

            <div className="md:ml-8 mt-5 md:mt-0 text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-800">
                {employee.name}
              </h1>

              <p className="text-lg text-gray-500 mt-2">
                {employee.designation}
              </p>

              <span className="inline-block mt-4 bg-teal-100 text-teal-700 px-5 py-2 rounded-full font-semibold">
                Employee ID : {employee.employeeId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white border rounded-xl shadow-md p-6 text-center hover:shadow-xl transition">
              <FaBuilding className="text-4xl text-teal-600 mx-auto mb-3" />

              <p className="text-gray-500">
                Department
              </p>

              <h2 className="text-xl font-bold">
                {employee.department}
              </h2>
            </div>

            <div className="bg-white border rounded-xl shadow-md p-6 text-center hover:shadow-xl transition">
              <FaBriefcase className="text-4xl text-blue-600 mx-auto mb-3" />

              <p className="text-gray-500">
                Designation
              </p>

              <h2 className="text-xl font-bold">
                {employee.designation}
              </h2>
            </div>

            <div className="bg-white border rounded-xl shadow-md p-6 text-center hover:shadow-xl transition">
              <FaMoneyBillWave className="text-4xl text-green-600 mx-auto mb-3" />

              <p className="text-gray-500">
                Salary
              </p>

              <h2 className="text-xl font-bold">
                ₹
                {Number(
                  employee.salary || 0
                ).toLocaleString("en-IN")}
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-teal-600 border-b pb-3 mb-5">
                Personal Information
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaUser />
                    Name
                  </span>

                  <span className="font-semibold text-right">
                    {employee.name}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope />
                    Email
                  </span>

                  <span className="font-semibold text-right break-all">
                    {employee.email}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaVenusMars />
                    Gender
                  </span>

                  <span className="font-semibold">
                    {employee.gender}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaBirthdayCake />
                    Date of Birth
                  </span>

                  <span className="font-semibold">
                    {employee.dob
                      ? new Date(
                          employee.dob
                        ).toLocaleDateString(
                          "en-GB"
                        )
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaHeart />
                    Marital Status
                  </span>

                  <span className="font-semibold">
                    {employee.maritalStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-teal-600 border-b pb-3 mb-5">
                Employment Information
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaIdBadge />
                    Employee ID
                  </span>

                  <span className="font-semibold">
                    {employee.employeeId}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaBuilding />
                    Department
                  </span>

                  <span className="font-semibold">
                    {employee.department}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaBriefcase />
                    Designation
                  </span>

                  <span className="font-semibold">
                    {employee.designation}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaMoneyBillWave />
                    Monthly Salary
                  </span>

                  <span className="font-semibold text-green-600">
                    ₹
                    {Number(
                      employee.salary || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;