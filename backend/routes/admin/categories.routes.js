import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../controllers/category.controller.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ✅ Routes
router.post("/", auth, authorize(["admin", "superadmin"]), createCategory);
router.get("/", auth, authorize(["admin", "superadmin", "editor"]), getAllCategories);
router.get("/:id", auth, authorize(["admin", "superadmin", "editor"]), getCategoryById);
router.put("/:id", auth, authorize(["admin", "superadmin"]), updateCategory);
router.delete("/:id", auth, authorize(["superadmin"]), deleteCategory);

export default router;
