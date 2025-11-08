import express from "express";
import {
  createLibrary,
  getMyLibraries,
  addSongToLibrary,
  removeSongFromLibrary,
  deleteLibrary,
} from "../../controllers/userLibrary.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 🎵 User Library Routes
router.post("/", auth, createLibrary); // Create new library
router.get("/", auth, getMyLibraries); // View my libraries
router.post("/add", auth, addSongToLibrary); // Add song to library
router.post("/remove", auth, removeSongFromLibrary); // Remove song
router.delete("/:id", auth, deleteLibrary); // Delete library

export default router;
