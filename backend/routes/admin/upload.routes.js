import express from "express";
import { uploadFile } from "../../controllers/upload.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ✅ Protected upload route
router.post(
  "/",
  auth,
  authorize(["superadmin", "admin"]),
  upload.single("file"), // field name in frontend form
  uploadFile
);

export default router;
