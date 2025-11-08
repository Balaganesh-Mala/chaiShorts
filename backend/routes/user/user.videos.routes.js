import express from "express";
import Video from "../../models/video.model.js";

const router = express.Router();

// ✅ Get all videos (public)
router.get("/", async (req, res) => {
  try {
    const { search, category, song, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) filter.videoTitle = { $regex: search, $options: "i" };
    if (category) filter.linkedCategory = category;
    if (song) filter.linkedSong = song;
    if (status) filter.status = status;

    const total = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
      .populate("linkedSong", "songName singerName thumbnailUrl songUrl")
      .populate("linkedCategory", "categoryName categoryImage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: videos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get single video (public)
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("linkedSong", "songName singerName thumbnailUrl songUrl")
      .populate("linkedCategory", "categoryName categoryImage");

    if (!video)
      return res.status(404).json({ success: false, message: "Video not found" });

    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
