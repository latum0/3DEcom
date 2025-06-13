// uploadRoutes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();

// You can configure Cloudinary either manually or via CLOUDINARY_URL in your .env.
cloudinary.config();

// Use multer to handle parsing the file from the request.
const upload = multer();

// POST /api/upload route – this route will receive one file keyed by "file"
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file provided" });
  }

  // Use a stream to upload because req.file.buffer is available from multer.
  const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
    if (result) {
      res.status(200).json({ success: true, url: result.secure_url });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});



export default router;
