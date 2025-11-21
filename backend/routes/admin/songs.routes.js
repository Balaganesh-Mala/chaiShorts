import express from "express";
import {
  createSong,
  getAllSongs,
  getSongById,
  updateSong,
  deleteSong,
} from "../../controllers/song.controller.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", auth, authorize(["admin", "superadmin"]), createSong);
router.get("/", auth, authorize(["admin", "superadmin", "editor"]), getAllSongs);
router.get("/:id", auth, authorize(["admin", "superadmin", "editor"]), getSongById);
router.put("/:id", auth, authorize(["admin", "superadmin"]), updateSong);
router.delete("/:id", auth, authorize(["superadmin"]), deleteSong);

export default router;
