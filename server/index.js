
import "dotenv/config";
import express from "express";
import cors from "cors";
import dns from "dns";
import { clerkMiddleware } from "@clerk/express";

import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import salaryRouter from "./routes/salary.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import connectToDatabase from "./db/db.js";

const dbUrl = process.env.ATLASDB_URL;

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

const app = express();

// Clerk middleware
app.use(clerkMiddleware());

app.use(cors());
app.use(express.json());

// Static folder
app.use("/uploads", express.static("public/uploads"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/leave", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Database
connectToDatabase();

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});