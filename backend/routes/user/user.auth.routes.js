import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  upgradeSubscription,
} from "../../controllers/userAuth.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 👤 User Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, getProfile);
router.post("/upgrade", auth, upgradeSubscription);

export default router;
