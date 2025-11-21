// controllers/songs.controller.js
import mongoose from "mongoose";
import Song from "../models/song.model.js";
import Movie from "../models/movie.model.js";
import { createLog } from "../services/logger.service.js";

/**
 * CREATE SONG
 */
export const createSong = async (req, res) => {
  try {
    const {
      linkedVideos = [],
      movieId = null,
      songName,
      songUrl,
      thumbnailUrl,
      categoryName,
      singerName,
      authorName,
      description,
      duration,
      language,
      genre,
      status,
    } = req.body;

    if (!songName || !songUrl) {
      return res
        .status(400)
        .json({ success: false, message: "songName and songUrl are required" });
    }

    // Validate movieId (if provided)
    if (movieId) {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({ success: false, message: "Invalid movieId" });
      }

      const exists = await Movie.findById(movieId);
      if (!exists) {
        return res.status(400).json({ success: false, message: "Invalid movieId" });
      }
    }

    const song = await Song.create({
      songName,
      songUrl,
      thumbnailUrl,
      categoryName,
      singerName,
      authorName,
      description,
      duration,
      language,
      genre,
      status,
      linkedVideos,
      movieId: movieId || null,
      addedBy: req.user?.email || "admin",
    });

    // Add to movie linkedSongs
    if (movieId) {
      await Movie.findByIdAndUpdate(movieId, {
        $addToSet: { linkedSongs: song._id },
      });
    }

    await createLog({
      adminEmail: req.user?.email,
      action: "Created new song",
      module: "Songs",
      targetId: song._id,
      targetName: song.songName,
      req,
    });

    const populated = await Song.findById(song._id).populate(
      "movieId",
      "movieName posterUrl releaseYear"
    );

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: populated,
    });
  } catch (error) {
    console.error("createSong error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL SONGS (supports search, filters, pagination, movieId filter)
 */
export const getAllSongs = async (req, res) => {
  try {
    const {
      search,
      category,
      movieId: rawMovieId,
      sortBy = "createdAt",
      order = "desc",
      page: rawPage = "1",
      limit: rawLimit = "10",
      includeVideos,
    } = req.query;

    const page = Math.max(1, parseInt(rawPage, 10) || 1);
    const limit = Math.max(1, parseInt(rawLimit, 10) || 10);
    const sortOrder = order === "asc" ? 1 : -1;

    const filter = {};

    // text search
    if (search) filter.songName = { $regex: search, $options: "i" };

    // category filter
    if (category) filter.categoryName = category;

    // movie filter
    const movieId = rawMovieId || req.query.movie || null;

    if (movieId) {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({ success: false, message: "Invalid movieId" });
      }
      filter.movieId = movieId;
    }

    const total = await Song.countDocuments(filter);

    const allowedSort = ["createdAt", "totalPlays", "totalLikes", "songName"];
    const sortField = allowedSort.includes(sortBy) ? sortBy : "createdAt";

    let query = Song.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("movieId", "movieName posterUrl releaseYear");

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
      page,
      pages: Math.ceil(total / limit),
      data: songs,
    });
  } catch (error) {
    console.error("getAllSongs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET SONG BY ID
 */
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate(
        "linkedVideos",
        "videoTitle videoUrl thumbnailUrl duration viewsCount likesCount status"
      )
      .populate("movieId", "movieName posterUrl releaseYear");

    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    console.error("getSongById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE SONG
 */
export const updateSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const { linkedVideos = [], movieId = null } = req.body;

    const oldSong = await Song.findById(songId);
    if (!oldSong) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    // Validate new movieId
    if (movieId) {
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({ success: false, message: "Invalid movieId" });
      }
      const exists = await Movie.findById(movieId);
      if (!exists) {
        return res.status(400).json({ success: false, message: "Invalid movieId" });
      }
    }

    const updated = await Song.findByIdAndUpdate(
      songId,
      { ...req.body, linkedVideos, updatedAt: Date.now() },
      { new: true }
    );

    // Sync movie link
    const oldMovie = oldSong.movieId?.toString() || null;
    const newMovie = movieId || null;

    if (oldMovie !== newMovie) {
      if (oldMovie) {
        await Movie.findByIdAndUpdate(oldMovie, {
          $pull: { linkedSongs: songId },
        });
      }
      if (newMovie) {
        await Movie.findByIdAndUpdate(newMovie, {
          $addToSet: { linkedSongs: songId },
        });
      }
    }

    const populated = await Song.findById(songId).populate(
      "movieId",
      "movieName posterUrl releaseYear"
    );

    res.status(200).json({
      success: true,
      message: "Song updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("updateSong error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE SONG
 */
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    if (song.movieId) {
      await Movie.findByIdAndUpdate(song.movieId, {
        $pull: { linkedSongs: song._id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    console.error("deleteSong error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
