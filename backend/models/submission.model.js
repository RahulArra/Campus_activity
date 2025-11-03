const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This defines the structure for a single proof file
const proofSchema = new Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  fileType: { type: String }
}, { _id: false });

const submissionSchema = new Schema({
  // Link to the user who submitted it
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Link to the template that was used
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'ActivityTemplate',
    required: true
  },
  
  // This will store the dynamic form data
  data: {
    type: Schema.Types.Mixed,
    required: true
  },

  // This will be an array of proof files from Shravan's upload API
  proofs: [proofSchema],

  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'submitted'
  },
  
  // Optional: for admin feedback
  remarks: {
    type: String
  }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// This is the most important part:
const Submission = mongoose.model('Submission', submissionSchema);

// This exports the model
module.exports = Submission;