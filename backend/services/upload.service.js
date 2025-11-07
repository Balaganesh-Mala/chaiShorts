import cloudinary from "../config/cloudStorage.js";
import fs from "fs";

export const uploadToCloudinary = async (filePath, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      resource_type: "auto", // auto-detects image, audio, or video
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(filePath);
    throw new Error("Cloudinary upload failed: " + error.message);
  }
};
