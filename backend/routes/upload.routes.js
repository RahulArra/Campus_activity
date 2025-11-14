const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // multer
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { authenticateJWT: verifyToken } = require('../middleware/auth.middleware.js');

async function uploadBufferToCloudinary(buffer, options = {}) {
  const defaultOptions = {
    folder: 'activity_uploads',
    resource_type: 'auto'
  };
  
  // For PDFs, ensure we use the correct resource type and flags
  if (options.format === 'pdf') {
    defaultOptions.resource_type = 'raw';
    defaultOptions.flags = 'attachment';
  }
  
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...defaultOptions, ...options },
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
        
        // --- !!! THIS IS THE FIX !!! ---
        // Cloudinary returns resource_type 'raw' for PDFs, but the URL
        // might still say '/image/upload'. We must fix it.
        let finalUrl = result.secure_url;
        if (result.resource_type === 'raw' && finalUrl.includes('/image/upload/')) {
          finalUrl = finalUrl.replace('/image/upload/', '/raw/upload/');
        }
        // --- End of Fix ---

        res.json({
            url: finalUrl, // <-- Send the FIXED URL
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
