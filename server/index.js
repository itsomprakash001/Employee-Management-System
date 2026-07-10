import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import salaryRouter from "./routes/salary.js"; 
import leaveRoutes from "./routes/leaveRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import connectToDatabase from "./db/db.js";

connectToDatabase();

const app = express();

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





app.listen(process.env.PORT, () => {
  console.log(`Server is Running on port ${process.env.PORT}`);
});
