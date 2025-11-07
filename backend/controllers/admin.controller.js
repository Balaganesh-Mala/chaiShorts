import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";

// ✅ Create new admin (Only superadmin can do this)
export const createAdmin = async (req, res) => {
  try {
    const { adminName, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Admin already exists" });

    const newAdmin = new Admin({
      adminName,
      email,
      password,
      role,
    });

    await newAdmin.save();
    res.status(201).json({
      success: true,
      message: "Admin created successfully ✅",
      data: { adminName, email, role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single admin
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update admin details or role
export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    res.status(200).json({ success: true, message: "Admin updated successfully ✅", data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete admin (superadmin only)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    res.status(200).json({ success: true, message: "Admin deleted successfully ✅" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
