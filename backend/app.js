import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminRoutes from "./routes/admin/index.js";
import userRoutes from "./routes/user/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

app.get('/', (req, res) => res.send("API WORKING"));
// Error Handling
app.use(errorHandler);

export default app;
