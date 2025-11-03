const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This defines the structure for a single field inside a template
const fieldSchema = new Schema({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  options: [{ type: String }],
  min: { type: Number },
  max: { type: Number },
  multiple: { type: Boolean, default: false }
}, { _id: false });

// This defines the main template structure
const activityTemplateSchema = new Schema({
  templateName: {
    type: String,
    required: true,
    unique: true
  },
  templateCategory: {
    type: String,
    required: true
  },
  fields: [fieldSchema]
}, { timestamps: true });

// This is the most important part
const ActivityTemplate = mongoose.model('ActivityTemplate', activityTemplateSchema);

// This exports the model
module.exports = ActivityTemplate;