import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    songName: { type: String, required: true },
    authorName: { type: String },
    singerName: { type: String },
    categoryName: { type: String },
    movieName: { type: String },
    description: { type: String },
    duration: { type: String },
    language: { type: String },
    genre: { type: String },
    songUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    addedBy: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    totalPlays: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalFavorites: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Song = mongoose.model("Song", songSchema);
export default Song;
