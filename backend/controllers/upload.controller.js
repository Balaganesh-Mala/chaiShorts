import { uploadToCloudinary } from "../services/upload.service.js";

// ✅ Upload single file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const folder = req.body.folder || "chai_shorts"; // optional: folder name
    const fileUrl = await uploadToCloudinary(req.file.path, folder);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully ✅",
      fileUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
