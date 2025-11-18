import Movie from "../models/movie.model.js";
import Song from "../models/song.model.js";

export const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    movie.addedBy = req.user.email;

    await movie.save();

    res.status(201).json({
      success: true,
      message: "Movie created successfully ✅",
      data: movie
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const { search, language, year, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (search) filter.movieName = { $regex: search, $options: "i" };
    if (language) filter.language = language;
    if (year) filter.releaseYear = year;

    const total = await Movie.countDocuments(filter);

    const movies = await Movie.find(filter)
      .populate("linkedSongs", "songName singerName thumbnailUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: movies
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate("linkedSongs", "songName singerName thumbnailUrl");

    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    res.status(200).json({ success: true, data: movie });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    res.status(200).json({
      success: true,
      message: "Movie updated successfully ✅",
      data: movie
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully ✅"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

