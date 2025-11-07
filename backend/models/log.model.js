import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    module: { type: String }, // e.g. songs, videos, categories
    targetId: { type: String }, // ID of affected record
    targetName: { type: String }, // name/title of affected record
    status: { type: String, enum: ["success", "failed"], default: "success" },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
