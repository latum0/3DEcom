// uploadRoutes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();
cloudinary.config();            // make sure your CLOUDINARY_URL is set

const upload = multer();        // no destination: we’ll stream from buffer

/**
 * POST /api/upload
 * Accepts multiple files under the field name “files”
 * Returns: { success: true, urls: [ ... ] }
 */
router.post("/", upload.array("files", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No files provided" });
  }

  try {
    // For each file, return a Promise that resolves to its secure_url
    const uploadPromises = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "your_folder_name" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        })
    );

    // Wait for all uploads to finish
    const urls = await Promise.all(uploadPromises);

    return res.status(200).json({ success: true, urls });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error uploading images" });
  }
});

export default router;
