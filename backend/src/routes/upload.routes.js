// routes/uploads.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // multer
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const verifyToken = require('../middleware/auth');

async function uploadBufferToCloudinary(buffer, folder = 'activity_uploads') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' }, // auto detects pdf/image
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Accepts field 'files' as array
router.post('/', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploads = await Promise.all(req.files.map(async file => {
      const result = await uploadBufferToCloudinary(file.buffer);
      return {
        url: result.secure_url,
        filename: result.public_id,
        fileType: file.mimetype,
        width: result.width,
        height: result.height,
      };
    }));

    // If you want to save uploads attached to a submission, do it here or return to client
    return res.status(201).json({ files: uploads });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ message: 'File upload failed', error: err.message });
  }
});

module.exports = router;
