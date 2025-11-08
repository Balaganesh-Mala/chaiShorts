import Library from "../../models/library.model.js";
import Song from "../../models/song.model.js";

/**
 * ✅ Create new library (playlist)
 */
export const createLibrary = async (req, res) => {
  try {
    const { libraryName, description } = req.body;

    if (!libraryName) {
      return res.status(400).json({
        success: false,
        message: "Library name is required",
      });
    }

    const library = new Library({
      libraryName,
      description,
      createdBy: req.user.id,
      status: "active",
      isFeatured: false,
    });

    await library.save();

    res.status(201).json({
      success: true,
      message: "Library created successfully",
      data: library,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Get all libraries created by the logged-in user
 */
export const getMyLibraries = async (req, res) => {
  try {
    const libraries = await Library.find({ createdBy: req.user.id })
      .populate("listOfSongs", "songName singerName thumbnailUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: libraries.length,
      data: libraries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Add a song to user's library
 */
export const addSongToLibrary = async (req, res) => {
  try {
    const { libraryId, songId } = req.body;

    const library = await Library.findOne({
      _id: libraryId,
      createdBy: req.user.id,
    });

    if (!library)
      return res.status(404).json({
        success: false,
        message: "Library not found",
      });

    const song = await Song.findById(songId);
    if (!song)
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });

    if (library.listOfSongs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: "Song already exists in this library",
      });
    }

    library.listOfSongs.push(songId);
    await library.save();

    res.status(200).json({
      success: true,
      message: "Song added to library successfully",
      data: library,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Remove a song from user's library
 */
export const removeSongFromLibrary = async (req, res) => {
  try {
    const { libraryId, songId } = req.body;

    const library = await Library.findOne({
      _id: libraryId,
      createdBy: req.user.id,
    });

    if (!library)
      return res.status(404).json({
        success: false,
        message: "Library not found",
      });

    library.listOfSongs = library.listOfSongs.filter(
      (id) => id.toString() !== songId
    );

    await library.save();

    res.status(200).json({
      success: true,
      message: "Song removed from library successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Delete a library
 */
export const deleteLibrary = async (req, res) => {
  try {
    const library = await Library.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!library)
      return res.status(404).json({
        success: false,
        message: "Library not found or not yours",
      });

    res.status(200).json({
      success: true,
      message: "Library deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
