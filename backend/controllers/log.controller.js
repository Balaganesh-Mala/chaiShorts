import Log from "../models/log.model.js";

// ✅ Get all logs (Super Admin only)
export const getAllLogs = async (req, res) => {
  try {
    const { adminEmail, module } = req.query;
    const filter = {};
    if (adminEmail) filter.adminEmail = adminEmail;
    if (module) filter.module = module;

    const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
