import express from "express";
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../../controllers/admin.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ✅ Manage Admin Accounts
router.post("/", auth, authorize(["superadmin"]), createAdmin);
router.get("/", auth, authorize(["superadmin"]), getAllAdmins);
router.get("/:id", auth, authorize(["superadmin"]), getAdminById);
router.put("/:id", auth, authorize(["superadmin"]), updateAdmin);
router.delete("/:id", auth, authorize(["superadmin"]), deleteAdmin);

export default router;
