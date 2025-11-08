import Song from "../models/song.model.js";
import { createLog } from "../services/logger.service.js";

/**
 * ✅ Create a new Song
 * Only Admin / Superadmin can create songs
 */
export const createSong = async (req, res) => {
  try {
    const { linkedVideos } = req.body;

    const song = new Song({
      ...req.body,
      addedBy: req.user.email,
      linkedVideos: linkedVideos || [],
    });

    await song.save();

    // Log admin action
    await createLog({
      adminEmail: req.user.email,
      action: "Created new song",
      module: "Songs",
      targetId: song._id,
      targetName: song.songName,
      req,
    });

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: song,
    });
  } catch (error) {
    console.error("Error creating song:", error);
    await createLog({
      adminEmail: req.user.email,
      action: "Failed to create song",
      module: "Songs",
      status: "failed",
      req,
    });
    res.status(500).json({
      success: false,
      message: "Server error while creating song",
      error: error.message,
    });
  }
};


// ✅ Get all songs with optional linked video details
export const getAllSongs = async (req, res) => {
  try {
    const {
      search,
      category,
      movie,
      sortBy,
      order,
      page = 1,
      limit = 10,
      includeVideos,
    } = req.query;

    const filter = {};
    if (search) filter.songName = { $regex: search, $options: "i" };
    if (category) filter.categoryName = category;
    if (movie) filter.movieName = movie;

    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const total = await Song.countDocuments(filter);

    let query = Song.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // ✅ Populate linked videos when includeVideos=true
    if (includeVideos === "true") {
      query = query.populate(
        "linkedVideos",
        "videoTitle videoUrl thumbnailUrl duration viewsCount likesCount status"
      );
    }

    const songs = await query;

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: songs,
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Get single song (with video details)
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate(
      "linkedVideos",
      "videoTitle videoUrl thumbnailUrl duration viewsCount likesCount status"
    );

    if (!song)
      return res.status(404).json({ success: false, message: "Song not found" });

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSong = async (req, res) => {
  try {
    const { linkedVideos } = req.body;

    const updatedData = {
      ...req.body,
      linkedVideos: linkedVideos || [],
      updatedAt: Date.now(),
    };

    const song = await Song.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    }).populate(
      "linkedVideos",
      "videoTitle videoUrl thumbnailUrl viewsCount likesCount status"
    );

    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: song,
    });
  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update song",
      error: error.message,
    });
  }
};

/**
 * ✅ Delete Song (Superadmin only)
 */
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    res.status(200).json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete song",
      error: error.message,
    });
  }
};
