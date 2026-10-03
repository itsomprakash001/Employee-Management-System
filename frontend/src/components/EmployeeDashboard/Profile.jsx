import { useEffect, useState } from "react";
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
          setLoading(false);
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

        if (response.data.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        console.log(
          "FETCH PROFILE ERROR:",
          error.response?.data || error.message
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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-sm font-medium text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-lg border bg-white px-6 py-5 text-sm font-medium text-red-600 shadow-sm">
          Unable to load profile
        </div>
      </div>
    );
  }

  const salary = Number(employee.salary || 0).toLocaleString("en-IN");

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB")
      : "N/A";

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        {icon}
        <span>{label}</span>
      </div>

      <span className="max-w-[60%] break-words text-right text-sm font-semibold text-gray-800">
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-teal-600 to-cyan-600" />

          <div className="px-5 pb-6 md:px-7">
            <div className="-mt-12 flex flex-col items-center gap-4 md:flex-row md:items-end">
              <img
                src={
                  employee.profileImage ||
                  "https://via.placeholder.com/140"
                }
                alt="Profile"
                className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-md"
              />

              <div className="text-center md:pb-1 md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">
                  {employee.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {employee.designation || "Employee"}
                </p>

                <span className="mt-2 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Employee ID: {employee.employeeId}
                </span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <FaBuilding className="text-lg text-teal-600" />
                  <span className="text-xs font-medium text-gray-500">
                    Department
                  </span>
                </div>
                <p className="font-semibold text-gray-800">
                  {employee.department || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <FaBriefcase className="text-lg text-blue-600" />
                  <span className="text-xs font-medium text-gray-500">
                    Designation
                  </span>
                </div>
                <p className="font-semibold text-gray-800">
                  {employee.designation || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <FaMoneyBillWave className="text-lg text-green-600" />
                  <span className="text-xs font-medium text-gray-500">
                    Monthly Salary
                  </span>
                </div>
                <p className="font-semibold text-gray-800">
                  ₹{salary}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-base font-semibold text-gray-800">
                    Personal Information
                  </h2>
                </div>

                <div className="px-5">
                  <InfoRow
                    icon={<FaUser className="text-teal-600" />}
                    label="Name"
                    value={employee.name}
                  />

                  <InfoRow
                    icon={<FaEnvelope className="text-teal-600" />}
                    label="Email"
                    value={employee.email}
                  />

                  <InfoRow
                    icon={<FaVenusMars className="text-teal-600" />}
                    label="Gender"
                    value={employee.gender}
                  />

                  <InfoRow
                    icon={<FaBirthdayCake className="text-teal-600" />}
                    label="Date of Birth"
                    value={formatDate(employee.dob)}
                  />

                  <InfoRow
                    icon={<FaHeart className="text-teal-600" />}
                    label="Marital Status"
                    value={employee.maritalStatus}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-base font-semibold text-gray-800">
                    Employment Information
                  </h2>
                </div>

                <div className="px-5">
                  <InfoRow
                    icon={<FaIdBadge className="text-blue-600" />}
                    label="Employee ID"
                    value={employee.employeeId}
                  />

                  <InfoRow
                    icon={<FaBuilding className="text-blue-600" />}
                    label="Department"
                    value={employee.department}
                  />

                  <InfoRow
                    icon={<FaBriefcase className="text-blue-600" />}
                    label="Designation"
                    value={employee.designation}
                  />

                  <InfoRow
                    icon={<FaMoneyBillWave className="text-green-600" />}
                    label="Monthly Salary"
                    value={`₹${salary}`}
                  />
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