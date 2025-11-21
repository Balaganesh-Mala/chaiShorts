import express from "express";
import authRoutes from "./auth.routes.js";
import songsRoutes from "./songs.routes.js";
import moviesRoutes from "./movies.routes.js";
import uploadRoutes from "./upload.routes.js";
import usersRoutes from "./users.routes.js";
import videosRoutes from "./videos.routes.js";
import categoriesRoutes from "./categories.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import settingsRoutes from "./settings.routes.js";
import logsRoutes from "./logs.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/songs", songsRoutes);
router.use("/upload", uploadRoutes);
router.use("/users", usersRoutes);
router.use("/videos", videosRoutes);
router.use("/categories", categoriesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingsRoutes);
router.use("/logs", logsRoutes);
router.use("/movies", moviesRoutes);

router.get("/", (req, res) => res.send("Admin routes working"));

export default router;
