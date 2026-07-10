import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";

// Dashboard
import AdminSummary from "./components/dashboard/AdminSummary";

// Department
import DepartmentList from "./components/departments/DeparmentList";
import AddDepartment from "./components/departments/AddDepartment";
import EditDepartment from "./components/departments/EditDepartment";

// Employee
import List from "./components/employee/List";
import Add from "./components/employee/Add";
import View from "./components/employee/View";
import Edit from "./components/employee/Edit";

// Leave
import LeaveList from "./components/leave/LeaveList";
import EmployeeLeave from "./components/leave/EmployeeLeave";

// Salary
import SalaryList from "./components/salary/List";
import AddSalary from "./components/salary/AddSalary";
import EditSalary from "./components/salary/EditSalary";
import SalaryHistory from "./components/salary/SalaryHistory";

// Admin Settings
import Settings from "./components/settings/Settings";

// Employee Dashboard
import EmployeeSummary from "./components/EmployeeDashboard/EmployeeSummary";
import Profile from "./components/EmployeeDashboard/Profile";
import MySalary from "./components/EmployeeDashboard/MySalary";
import ApplyLeave from "./components/EmployeeDashboard/ApplyLeave";
import MyLeaves from "./components/EmployeeDashboard/MyLeaves";
import EditLeave from "./components/EmployeeDashboard/EditLeave";
import Setting from "./components/EmployeeDashboard/Setting";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        {/* ADMIN */}

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin"]}>
                <AdminDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />} />

          <Route path="departments" element={<DepartmentList />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="departments/edit/:id" element={<EditDepartment />} />

          <Route path="employees" element={<List />} />
          <Route path="add-employee" element={<Add />} />
          <Route path="employee/:id" element={<View />} />
          <Route path="employees/edit/:id" element={<Edit />} />

          <Route path="salary" element={<SalaryList />} />
          <Route path="salary/add" element={<AddSalary />} />
          <Route path="salary/edit/:id" element={<EditSalary />} />
          <Route path="salary-history/:id" element={<SalaryHistory />} />

          <Route path="leave" element={<LeaveList />} />
          <Route path="employee-leaves/:id" element={<EmployeeLeave />} />

          <Route path="settings" element={<Settings />} />
        </Route>

        {/* EMPLOYEE */}

        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["employee"]}>
                <EmployeeDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<EmployeeSummary />} />

          <Route path="profile" element={<Profile />} />

          <Route path="salary" element={<MySalary />} />

          <Route path="apply-leave" element={<ApplyLeave />} />

          <Route path="my-leaves" element={<MyLeaves />} />

          <Route path="edit-leave/:id" element={<EditLeave />} />

          <Route path="settings" element={<Setting />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;