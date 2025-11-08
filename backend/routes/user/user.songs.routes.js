import express from "express";
import Song from "../../models/song.model.js";

const router = express.Router();

// ✅ GET all songs (public)
router.get("/", async (req, res) => {
  try {
    const { search, category, movie, sortBy, order, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (search) filter.songName = { $regex: search, $options: "i" };
    if (category) filter.categoryName = category;
    if (movie) filter.movieName = movie;

    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const total = await Song.countDocuments(filter);

    const songs = await Song.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("linkedVideos", "videoTitle videoUrl thumbnailUrl duration"); // 🔗 include video details

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: songs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET single song (public)
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("linkedVideos", "videoTitle videoUrl thumbnailUrl duration");
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
