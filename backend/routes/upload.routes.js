// routes/uploads.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // multer
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { authenticateJWT: verifyToken } = require('../middleware/auth.middleware.js');

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

// Handle single file upload
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await uploadBufferToCloudinary(req.file.buffer);
        
        res.json({
            url: result.secure_url,
            filename: result.public_id,
            fileType: req.file.mimetype,
            width: result.width,
            height: result.height
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            message: 'Error uploading file',
            error: error.message 
        });
    }
});

module.exports = router;
