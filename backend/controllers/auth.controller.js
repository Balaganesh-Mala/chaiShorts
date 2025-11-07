import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";

// ✅ Generate JWT token
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ Admin Register (SuperAdmin can create)
export const registerAdmin = async (req, res) => {
  try {
    const { adminName, email, password, role } = req.body;

    // Check if any admin exists
    const adminCount = await Admin.countDocuments();

    // Allow first admin without auth (superadmin bootstrap)
    if (adminCount > 0 && !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // If admins exist, check if requester is superadmin
    if (adminCount > 0 && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only superadmin can register admins" });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ success: false, message: "Email already registered" });

    // Create new admin
    const newAdmin = new Admin({ adminName, email, password, role });
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: adminCount === 0
        ? "SuperAdmin registered successfully"
        : "Admin registered successfully",
      data: {
        id: newAdmin._id,
        adminName: newAdmin.adminName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check admin existence
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Generate JWT token
    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
