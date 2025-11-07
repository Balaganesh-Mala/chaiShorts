import express from "express";
import authRoutes from "./user.auth.routes.js";

const router = express.Router();

// Combine all user routes
router.use("/auth", authRoutes);

// Test route
router.get("/", (req, res) => {
  res.json({ success: true, message: "User routes working" });
});

export default router;
