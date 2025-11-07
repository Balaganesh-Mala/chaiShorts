import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    libraryName: { type: String, required: true },
    description: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Library", librarySchema);
