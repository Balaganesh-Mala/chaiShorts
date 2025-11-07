import express from "express";
import { registerAdmin, loginAdmin, getAdminProfile } from "../../controllers/auth.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 👇 Unprotected temporarily — controller logic will handle restriction
router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

// Protected route for profile
router.get("/profile", auth, getAdminProfile);

export default router;
