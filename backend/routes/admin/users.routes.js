import express from "express";
import {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
} from "../../controllers/user.controller.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ✅ Only Admins can access user data
router.get("/", auth, authorize(["superadmin", "admin", "editor"]), getAllUsers);
router.get("/:id", auth, authorize(["superadmin", "admin", "editor"]), getUserById);
router.patch("/:id/status", auth, authorize(["superadmin", "admin"]), toggleUserStatus);
router.delete("/:id", auth, authorize(["superadmin"]), deleteUser);

export default router;
