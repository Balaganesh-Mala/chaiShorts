import Video from "../models/video.model.js";
import Song from "../models/song.model.js";

/**
 * ✅ Create new short video
 */
export const createVideo = async (req, res) => {
  try {
    const { linkedSong } = req.body;

    const video = new Video({
      ...req.body,
      addedBy: req.user.email,
    });

    await video.save();

    // 🔗 Optional: Auto-add this video ID into Song.linkedVideos[]
    if (linkedSong) {
      await Song.findByIdAndUpdate(linkedSong, {
        $push: { linkedVideos: video._id },
      });
    }

    res.status(201).json({
      success: true,
      message: "Video added successfully ✅",
      data: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add video",
      error: error.message,
    });
  }
};

/**
 * ✅ Get all videos (filter by song, category, or status)
 */
export const getAllVideos = async (req, res) => {
  try {
    const { status, category, song } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.linkedCategory = category;
    if (song) filter.linkedSong = song;

    const videos = await Video.find(filter)
      .populate("linkedSong", "songName singerName thumbnailUrl")
      .populate("linkedCategory", "categoryName categoryImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: videos.length, data: videos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
      error: error.message,
    });
  }
};

/**
 * ✅ Get single video by ID
 */
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("linkedSong", "songName singerName thumbnailUrl")
      .populate("linkedCategory", "categoryName categoryImage");

    if (!video)
      return res.status(404).json({ success: false, message: "Video not found" });

    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching video",
      error: error.message,
    });
  }
};

/**
 * ✅ Update video details (approve, reject, feature, etc.)
 */
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("linkedSong", "songName singerName thumbnailUrl")
      .populate("linkedCategory", "categoryName categoryImage");

    if (!video)
      return res.status(404).json({ success: false, message: "Video not found" });

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update video",
      error: error.message,
    });
  }
};

/**
 * ✅ Delete video
 */
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video)
      return res.status(404).json({ success: false, message: "Video not found" });

    // 🧹 Optional: Remove this video ID from linked song
    if (video.linkedSong) {
      await Song.findByIdAndUpdate(video.linkedSong, {
        $pull: { linkedVideos: video._id },
      });
    }

    res.status(200).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message,
    });
  }
};
