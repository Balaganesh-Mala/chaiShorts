import express from "express";
import Movie from "../../models/movie.model.js";

const router = express.Router();

// ✅ Get all movies (public)
router.get("/", async (req, res) => {
  try {
    const { search, category, language, sortBy, order, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (search) filter.movieName = { $regex: search, $options: "i" };
    if (category) filter.categoryName = category;
    if (language) filter.language = language;

    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const total = await Movie.countDocuments(filter);

    const movies = await Movie.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select(
        "movieName directorName cast description releaseDate language duration categoryName thumbnailUrl videoUrl status isFeatured isTrending"
      );

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: movies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get single movie by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).select(
      "movieName directorName cast description releaseDate language duration categoryName thumbnailUrl videoUrl status isFeatured isTrending"
    );
    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
