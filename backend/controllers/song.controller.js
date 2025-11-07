import Song from "../models/song.model.js";
import { createLog } from "../services/logger.service.js";


// ✅ Create new song
export const createSong = async (req, res) => {
  try {
    const song = new Song(req.body);
    song.addedBy = req.user.email;
    await song.save();

    // Log action
    await createLog({
      adminEmail: req.user.email,
      action: "Created new song",
      module: "Songs",
      targetId: song._id,
      targetName: song.songName,
      req,
    });

    res.status(201).json({ success: true, message: "Song created successfully", data: song });
  } catch (error) {
    await createLog({
      adminEmail: req.user.email,
      action: "Failed to create song",
      module: "Songs",
      status: "failed",
      req,
    });
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Get all songs (with filters)
// ✅ Get all songs (with pagination, filters & sorting)
export const getAllSongs = async (req, res) => {
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
      .limit(Number(limit));

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
};


// ✅ Get single song
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    res.status(200).json({ success: true, data: song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update song
export const updateSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    res.status(200).json({ success: true, message: "Song updated successfully", data: song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete song
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });
    res.status(200).json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
