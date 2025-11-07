import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  upgradeSubscription,
} from "../../controllers/userAuth.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 🟢 Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🟡 Protected routes
router.get("/profile", auth, getProfile);
router.patch("/subscription/upgrade", auth, upgradeSubscription);

export default router;
