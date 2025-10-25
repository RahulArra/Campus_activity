const ActivitySubmission = require('../models/ActivitySubmission');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

async function uploadBufferToCloudinary(buffer, folder = 'activity_uploads') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

const uploadFiles = async (req, res) => {
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

    // Save to database
    const submission = new ActivitySubmission({
      studentId: req.body.studentId || req.user.id, // Use from body or auth user
      studentName: req.body.studentName,
      templateId: req.body.templateId,
      department: req.body.department,
      title: req.body.title,
      description: req.body.description,
      files: uploads
    });
    await submission.save();

    return res.status(201).json({ submission, files: uploads });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ message: 'File upload failed', error: err.message });
  }
};

module.exports = { uploadFiles };
