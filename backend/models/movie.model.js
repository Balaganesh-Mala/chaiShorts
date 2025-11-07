import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    movieName: { type: String, required: true },
    directorName: { type: String },
    castNames: [String],
    releaseYear: { type: Number },
    language: { type: String },
    description: { type: String },
    posterUrl: { type: String },
    bannerUrl: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    addedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Movie", movieSchema);
