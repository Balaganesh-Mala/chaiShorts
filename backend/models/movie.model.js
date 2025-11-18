import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    movieName: { type: String, required: true },
    directorName: { type: String },
    cast: { type: String }, 
    releaseYear: { type: Number },
    
    language: { type: String },
    description: { type: String },

    // ✅ Movie Poster / Banner
    posterUrl: { type: String },
    bannerUrl: { type: String },

    // ✅ To show songs linked to movie
    linkedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      }
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    addedBy: { type: String }
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
