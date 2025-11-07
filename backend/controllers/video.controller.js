import Video from "../models/video.model.js";

// ✅ Create new short video
export const createVideo = async (req, res) => {
  try {
    const video = new Video(req.body);
    video.addedBy = req.user.email;
    await video.save();
    res.status(201).json({
      success: true,
      message: "Video added successfully ✅",
      data: video,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all videos (with optional filters)
export const getAllVideos = async (req, res) => {
  try {
    const { status, category, song } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.linkedCategory = category;
    if (song) filter.linkedSong = song;

    // 🔥 populate linked song & category
    const videos = await Video.find(filter)
      .populate("linkedSong", "songName singerName thumbnailUrl")
      .populate("linkedCategory", "categoryName categoryImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get video by ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("linkedSong", "songName singerName thumbnailUrl")
      .populate("linkedCategory", "categoryName categoryImage");

    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update video details (e.g. approve/reject/feature)
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });
    res.status(200).json({ success: true, message: "Video updated successfully", data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete video
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });
    res.status(200).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
