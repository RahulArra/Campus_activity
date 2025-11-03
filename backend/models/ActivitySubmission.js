// models/ActivitySubmission.js
const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  url: String,
  filename: String, // public_id
  fileType: String, // mimetype or derived
});

const ActivitySubmissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivityTemplate' },
  department: String,
  title: String,
  description: String,
  files: [FileSchema],
  date: { type: Date, default: Date.now },
  // other fields...
}, { timestamps: true });

module.exports = mongoose.model('ActivitySubmission', ActivitySubmissionSchema);
