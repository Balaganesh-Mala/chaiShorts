import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    movieName: { type: String, required: true },
    directorName: { type: String },
    // store cast as array of strings (more flexible)
    cast: [{ type: String }],

    releaseYear: { type: Number },
    language: { type: String },
    description: { type: String },

    posterUrl: { type: String },
    bannerUrl: { type: String },

    // Songs belonging to this movie (ObjectId refs)
    linkedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    addedBy: { type: String },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
