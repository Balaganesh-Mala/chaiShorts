import express from "express";
import {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie
} from "../../controllers/movie.controller.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ✅ Routes
router.post("/", auth, authorize(["admin", "superadmin"]), createMovie);
router.get("/", auth, authorize(["admin", "superadmin", "editor"]), getAllMovies);
router.get("/:id", auth, authorize(["admin", "superadmin", "editor"]), getMovieById);
router.put("/:id", auth, authorize(["admin", "superadmin"]), updateMovie);
router.delete("/:id", auth, authorize(["superadmin"]), deleteMovie);

export default router;
