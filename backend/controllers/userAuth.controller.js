import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ 1️⃣ Register User (Free by default)
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords do not match" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      mobileNumber,
      password: hashedPassword,
      subscriptionType: "free",
      isSubscribed: false,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        subscriptionType: user.subscriptionType,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2️⃣ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user._id);

    // update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        subscriptionType: user.subscriptionType,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3️⃣ Get User Profile (Authenticated)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 4️⃣ Upgrade Subscription (Free → Premium)
export const upgradeSubscription = async (req, res) => {
  try {
    const { type, durationInDays } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (type !== "premium") return res.status(400).json({ success: false, message: "Invalid subscription type" });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (durationInDays || 30));

    user.subscriptionType = "premium";
    user.isSubscribed = true;
    user.subscriptionStart = startDate;
    user.subscriptionEnd = endDate;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully",
      data: {
        subscriptionType: user.subscriptionType,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
