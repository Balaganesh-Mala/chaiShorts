import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    videoTitle: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    duration: { type: String },

    // 🔗 Relations
    linkedSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song", // Song reference
    },
    linkedCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Category reference
    },

    uploadedBy: { type: String }, // username or userId (from user collection)
    addedBy: { type: String }, // which admin added it

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "approved",
    },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);
export default Video;
