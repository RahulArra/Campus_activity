const mongoose = require("mongoose");

const uploadSummarySchema = new mongoose.Schema({
  department: { type: String, required: true },
  uploadedCount: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UploadSummary", uploadSummarySchema);
