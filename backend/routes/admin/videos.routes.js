import express from "express";
import {
  createVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../../controllers/video.controller.js";

import Song from "../../models/song.model.js";
import Category from "../../models/category.model.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ✅ Admin routes for short videos
router.post("/", auth, authorize(["admin", "superadmin"]), createVideo);
router.get("/", auth, authorize(["admin", "superadmin", "editor"]), getAllVideos);
router.get("/:id", auth, authorize(["admin", "superadmin", "editor"]), getVideoById);
router.put("/:id", auth, authorize(["admin", "superadmin"]), updateVideo);
router.delete("/:id", auth, authorize(["superadmin"]), deleteVideo);

// ✅ Fetch all songs for dropdown
router.get("/helpers/songs", auth, authorize(["admin", "superadmin"]), async (req, res) => {
  try {
    const songs = await Song.find({}, "_id songName singerName thumbnailUrl");
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Fetch all categories for dropdown
router.get("/helpers/categories", auth, authorize(["admin", "superadmin"]), async (req, res) => {
  try {
    const categories = await Category.find({}, "_id categoryName categoryImage");
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
