import express from "express";
import { getDashboardData } from "../../controllers/dashboard.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", auth, authorize(["admin", "superadmin", "editor"]), getDashboardData);

export default router;
