# Employee Management System (EMS)

A full-stack **Employee Management System** built with **React, Vite, Node.js, Express, MongoDB Atlas, Clerk, and Cloudinary**.

EMS allows companies to manage employees, departments, salaries, leaves, profiles, and authentication through a secure role-based system.

---

## 🚀 Features

### 🔐 Authentication

* Clerk-based authentication
* Company account registration
* Email verification
* Secure login/logout
* JWT-based backend authentication
* Protected frontend routes
* Protected backend APIs

### 🏢 Company Management

* Create a company during registration
* Company name must be unique
* First registered user becomes the company head
* Company head uses the `admin` role
* Employees are isolated by `companyId`
* Users can only access data belonging to their company

### 👥 Role-Based Access Control

EMS supports the following roles:

| Role                 | Level |
| -------------------- | ----: |
| Admin / Company Head |     5 |
| Manager              |     4 |
| HR                   |     3 |
| Team Lead (TL)       |     2 |
| Employee             |     1 |

Permissions are enforced on the **backend**, not only through the React UI.

#### Admin / Company Head

* Manage company employees
* Manage departments
* Manage salaries
* View and manage leaves
* Manage lower-level users
* Access company-wide dashboard

#### Manager

* Manage employees according to role hierarchy
* Manage departments
* Manage salaries
* Manage eligible employee leaves
* Access management dashboard

#### HR

* Manage eligible employees
* Add employees subject to the HR employee limit
* Manage eligible employee information
* Access management dashboard

#### Team Lead

* Manage eligible employees
* Approve/reject eligible employee leaves
* Access management dashboard

#### Employee

* View personal profile
* View salary information
* Apply for leave
* View own leaves
* Edit eligible pending leave requests
* Manage personal settings

---

## 🛡️ Role Hierarchy

The backend uses a role hierarchy to control management permissions.

```text
Admin
  ↓
Manager
  ↓
HR
  ↓
TL
  ↓
Employee
```

A higher-level user can manage users below their role level.

Users cannot manage users at the same level or above them.

---

## 🏢 Company Data Isolation

Every major company-related resource contains a `companyId`.

Examples:

```text
User
Employee
Department
Salary
Leave
```

This prevents users from one company accessing another company's data.

For example:

```text
Company A
├── Admin
├── Manager
├── HR
└── Employees

Company B
├── Admin
├── Manager
├── HR
└── Employees
```

The Company A admin cannot access Company B employees.

---

## 👨‍💼 Employee Management

The system supports:

* Add employees
* View employee details
* Edit employee details
* Employee profile
* Profile image
* Department assignment
* Designation
* Gender
* Marital status
* Date of birth
* Salary information
* Employee ID

Employee profile images are stored using **Cloudinary**.

---

## 🏬 Department Management

Departments are company-specific.

Features include:

* Create department
* Edit department
* Delete department
* View departments
* Department description
* Duplicate department names are prevented within the same company

Only authorized management roles can manage departments.

---

## 💰 Salary Management

EMS provides salary management functionality including:

* Add salary
* Edit salary
* View salary
* Salary history
* Basic salary
* Allowances
* Deductions
* Net salary
* Payment date
* Payment status

Salary records are associated with both:

```text
Employee
Company
```

This maintains company-level data isolation.

---

## 📝 Leave Management

Employees can apply for different types of leave:

* Casual Leave
* Sick Leave
* Annual Leave
* Emergency Leave

Each leave request contains:

* Leave type
* From date
* To date
* Total days
* Reason
* Status

Leave statuses:

```text
Pending
Approved
Rejected
```

### Leave Approval Hierarchy

Leave approval follows the role hierarchy.

```text
Admin → Manager
Admin → HR
Admin → TL
Admin → Employee

Manager → HR
Manager → TL
Manager → Employee

HR → TL
HR → Employee

TL → Employee
```

A user cannot approve or reject their own leave.

The company head (`admin`) cannot apply for leave.

---

## 📊 Dashboards

### Management Dashboard

Available to:

```text
Admin
Manager
HR
TL
```

The management dashboard provides access to company management features according to the user's role.

### Employee Dashboard

Available to:

```text
Employee
```

Employees can access:

* Dashboard
* Profile
* Salary
* Apply Leave
* My Leaves
* Leave editing
* Settings

---

## ☁️ Cloudinary

Employee profile images are uploaded to Cloudinary.

The application stores:

```text
profileImage
profileImagePublicId
```

The Cloudinary public ID allows uploaded images to be managed or removed when required.

---

## 🗄️ Database

EMS uses **MongoDB Atlas**.

Main database models include:

```text
User
Company
Employee
Department
Salary
Leave
```

Relationships are maintained using MongoDB ObjectIds.

Example:

```text
Company
   │
   ├── Users
   ├── Employees
   ├── Departments
   ├── Salaries
   └── Leaves
```

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Clerk React

### Backend

* Node.js
* Express
* MongoDB
* Mongoose
* Clerk Express
* JWT
* Multer
* Cloudinary

### Database

* MongoDB Atlas

### Deployment

* Render
* GitHub

---

## 📁 Project Structure

```text
EMS/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── departments/
│   │   │   ├── employee/
│   │   │   ├── leave/
│   │   │   ├── salary/
│   │   │   ├── settings/
│   │   │   └── EmployeeDashboard/
│   │   │
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## ⚙️ Environment Variables

### Frontend

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

`VITE_` variables are exposed to the frontend, so **never put private secrets here**.

---

### Backend

Create:

```text
server/.env
```

Example:

```env
ATLASDB_URL=your_mongodb_atlas_connection_string

JWT_KEY=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

CLIENT_URL=https://your-frontend.onrender.com
```

Never commit `.env` files containing secrets to GitHub.

---

## 💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

```bash
cd EMS
```

---

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

---

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

Start the backend:

```bash
npm start
```

---

## 🔌 API Configuration

The frontend does not use hard-coded localhost API URLs.

API requests use:

```js
import API_URL from "../api";
```

or the appropriate relative import path.

The API base URL is configured through:

```env
VITE_API_URL
```

Example:

```env
VITE_API_URL=http://localhost:5000
```

for local development.

For production:

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🌐 Production Deployment

EMS can be deployed using **Render**.

### Backend

Deploy the `server` directory as a:

```text
Web Service
```

Recommended configuration:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

The backend uses:

```js
const PORT = process.env.PORT || 5000;
```

and binds to:

```text
0.0.0.0
```

for Render deployment.

Add all backend environment variables in the Render dashboard.

---

### Frontend

Deploy the `frontend` directory as a:

```text
Static Site
```

Recommended configuration:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Add:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

---

## 🔄 React Router Configuration

Because EMS uses React Router with `BrowserRouter`, the frontend hosting service must rewrite application routes to `index.html`.

For Render, configure a rewrite:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

This allows routes such as:

```text
/login
/admin-dashboard
/admin-dashboard/employees
/admin-dashboard/salary
/employee-dashboard
/employee-dashboard/profile
```

to work correctly when directly accessed or refreshed.

---

## 🔒 Security

The application uses multiple layers of protection:

* Clerk authentication
* Backend authentication middleware
* Protected React routes
* Role-based authorization
* Company-level data isolation
* Role hierarchy checks
* Backend permission validation
* Environment variables for secrets
* MongoDB Atlas
* Cloudinary for image storage

Frontend route protection alone is **not considered sufficient authorization**. Backend APIs also validate the authenticated user and their permissions.

---

## 📌 Important Notes

### Do not commit secrets

Never commit:

```text
.env
.env.local
```

or credentials such as:

```text
MongoDB passwords
JWT secrets
Clerk secret keys
Cloudinary API secrets
```

### Production URLs

Local development:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:5000
```

Production:

```text
Frontend → https://your-frontend.onrender.com
Backend  → https://your-backend.onrender.com
```

---

## 🧪 Production Build

To verify that the frontend can be built for production:

```bash
cd frontend
npm run build
```

The production files are generated in:

```text
frontend/dist
```

A large JavaScript bundle warning from Vite does not necessarily indicate a build failure if the build completes successfully.

---

## 📈 Future Improvements

Possible future improvements include:

* Advanced employee search and filtering
* Pagination
* Attendance management
* Payroll automation
* Email notifications
* Leave balance tracking
* Employee performance management
* Audit logs
* Advanced analytics
* Automated backups
* More granular permissions
* Improved bundle code splitting




