import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String },
    email: { type: String, unique: true, required: true },
    mobileNumber: { type: String },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "blocked"], default: "active" },

    // 🟢 Subscription Fields
    subscriptionType: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },

    dateOfRegistration: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    totalFavorites: { type: Number, default: 0 },
    totalUploadedVideos: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate fullName
userSchema.pre("save", function (next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
