import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentType: { type: String, enum: ["song", "video"], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    addedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Favorite", favoriteSchema);
