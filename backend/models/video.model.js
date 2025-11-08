import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    videoTitle: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    duration: { type: String },

    // 🔗 Relations
    linkedSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song", // Must match Song model name
    },
    linkedCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Must match Category model name
    },

    uploadedBy: { type: String }, // user email or ID
    addedBy: { type: String }, // admin who added video

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
