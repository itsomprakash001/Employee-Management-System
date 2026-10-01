# EMS Frontend

Frontend application for the **Employee Management System (EMS)** built with React and Vite.

## 🚀 Features

* 🔐 Clerk authentication
* 👥 Role-based dashboards
* 🏢 Company and employee management
* 🏬 Department management
* 💰 Salary management
* 📝 Leave management
* 👤 Employee profiles
* 📊 Admin and employee dashboards
* 🔒 Protected routes

## 🛠️ Tech Stack

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Clerk

## ⚙️ Setup

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start development server:

```bash
npm run dev
```

## 📦 Production Build

```bash
npm run build
```

The production files are generated in:

```text
dist/
```

## 🌐 Deployment

The frontend is deployed as a **Render Static Site**.

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

## 🔗 Backend

The frontend communicates with the EMS backend using:

```env
VITE_API_URL
```

Never commit environment files or sensitive credentials to GitHub.

