import express from "express";
import { getAllLogs } from "../../controllers/log.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", auth, authorize(["superadmin"]), getAllLogs);

export default router;
