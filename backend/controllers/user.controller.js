import User from "../models/user.model.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

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
    res.status(201).json({
      success: true,
      message: "User added successfully by admin",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const { subscriptionType, status, search } = req.query;
    const filter = {};

    if (subscriptionType) filter.subscriptionType = subscriptionType;
    if (status) filter.status = status;
    if (search)
      filter.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Get single user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Block or Unblock user
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.status === "active" ? "unblocked" : "blocked"} successfully`,
      data: { id: user._id, status: user.status },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Delete user (Admin only)
 */
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
