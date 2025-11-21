import Movie from "../models/movie.model.js";
import Song from "../models/song.model.js";

/**
 * Create Movie
 * If linkedSongs provided, this will also set those songs' movieId to the created movie.
 */
export const createMovie = async (req, res) => {
  try {
    const payload = { ...req.body };
    // normalize cast if string passed
    if (typeof payload.cast === "string") {
      payload.cast = payload.cast.split(",").map((c) => c.trim()).filter(Boolean);
    }

    const movie = new Movie(payload);
    movie.addedBy = req.user?.email || "system";

    await movie.save();

    // If linkedSongs were passed as IDs, attach them to songs (set their movieId)
    if (Array.isArray(payload.linkedSongs) && payload.linkedSongs.length) {
      await Song.updateMany(
        { _id: { $in: payload.linkedSongs } },
        { $set: { movieId: movie._id } }
      );
      // ensure movie.linkedSongs stays accurate
      movie.linkedSongs = payload.linkedSongs;
      await movie.save();
    }

    res.status(201).json({
      success: true,
      message: "Movie created successfully ✅",
      data: movie,
    });
  } catch (error) {
    console.error("createMovie error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all movies (with pagination & optional filters)
 */
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
      data: movies,
    });
  } catch (error) {
    console.error("getAllMovies error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single movie by id (populates linkedSongs)
 */
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate(
      "linkedSongs",
      "songName singerName thumbnailUrl songUrl"
    );

    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    console.error("getMovieById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update movie.
 * If linkedSongs is present in req.body, sync Song.movieId values and movie.linkedSongs array.
 */
export const updateMovie = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (typeof payload.cast === "string") {
      payload.cast = payload.cast.split(",").map((c) => c.trim()).filter(Boolean);
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    // If linkedSongs provided, compute diffs and sync Song.movieId
    if (Array.isArray(payload.linkedSongs)) {
      const oldLinked = movie.linkedSongs.map((id) => String(id));
      const newLinked = payload.linkedSongs.map((id) => String(id));

      const toAdd = newLinked.filter((id) => !oldLinked.includes(id));
      const toRemove = oldLinked.filter((id) => !newLinked.includes(id));

      if (toAdd.length) {
        await Song.updateMany({ _id: { $in: toAdd } }, { $set: { movieId: movie._id } });
      }
      if (toRemove.length) {
        await Song.updateMany({ _id: { $in: toRemove } }, { $set: { movieId: null } });
      }

      movie.linkedSongs = newLinked;
    }

    // update other fields
    Object.keys(payload).forEach((k) => {
      if (k !== "linkedSongs") movie[k] = payload[k];
    });

    await movie.save();

    const updated = await Movie.findById(movie._id).populate(
      "linkedSongs",
      "songName singerName thumbnailUrl"
    );

    res.status(200).json({
      success: true,
      message: "Movie updated successfully ✅",
      data: updated,
    });
  } catch (error) {
    console.error("updateMovie error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete movie
 * - Clear movieId from songs that belonged to this movie
 * - Then delete movie
 */
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    // unset movieId on songs that refer to this movie
    await Song.updateMany({ movieId: movie._id }, { $set: { movieId: null } });

    // delete movie
    await Movie.findByIdAndDelete(movie._id);

    res.status(200).json({ success: true, message: "Movie deleted successfully ✅" });
  } catch (error) {
    console.error("deleteMovie error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
