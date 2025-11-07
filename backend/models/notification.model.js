import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetAudience: { type: String, enum: ["all", "subscribers", "free-users"], default: "all" },
    scheduleDate: { type: Date },
    status: { type: String, enum: ["sent", "pending"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
