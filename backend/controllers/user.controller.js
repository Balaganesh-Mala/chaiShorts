import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ✅ Register new user
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      mobileNumber,
      gender,
      country,
      password,
      confirmPassword,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check duplicates
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ success: false, message: "Email already exists" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ success: false, message: "Username already taken" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      mobileNumber,
      gender,
      country,
      password: hashedPassword,
    });

    await user.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        gender: user.gender,
        country: user.country,
        status: user.status,
        dateOfRegistration: user.dateOfRegistration,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const { gender, country, status } = req.query;
    const filter = {};
    if (gender) filter.gender = gender;
    if (country) filter.country = country;
    if (status) filter.status = status;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Block / Unblock user
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.status === "active" ? "unblocked" : "blocked"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
