import express from "express";
import authRoutes from "./user.auth.routes.js";
import songsRoutes from "./user.songs.routes.js";
import videosRoutes from "./user.videos.routes.js";
import categoriesRoutes from "./user.categories.routes.js";
import moviesRoutes from "./user.movies.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/songs", songsRoutes);
router.use("/videos", videosRoutes);
router.use("/categories", categoriesRoutes);
router.use("/movies", moviesRoutes);

router.get("/", (req, res) => {
  res.json({ success: true, message: "User routes working ✅" });
});

export default router;
