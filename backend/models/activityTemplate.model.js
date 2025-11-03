const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. Schema for defining a single field within an activity template
const FieldSchema = new Schema({
    // Unique identifier for the field (e.g., 'event_name', 'position_achieved')
    fieldId: {
        type: String,
        required: true,
        unique: false,
        trim: true,
    },
    // The human-readable name of the field displayed on the form
    label: {
        type: String,
        required: true,
        trim: true,
    },
    // Input type for the frontend (e.g., 'text', 'number', 'date', 'select', 'file', 'textarea')
    type: {
        type: String,
        required: true,
        // Ensures only valid types can be saved
        enum: ['text', 'number', 'date', 'select', 'file', 'textarea'],
    },
    // Boolean indicating if the field is mandatory
    required: {
        type: Boolean,
        default: false,
    },
    // Array of options, only used if type is 'select'
    options: {
        type: [String],
        default: [],
    },
    // Optional placeholder text
    placeholder: {
        type: String,
        default: '',
    },
    // Used for number inputs
    min: {
        type: Number,
        default: null,
    },
    max: {
        type: Number,
        default: null,
    },
    // Retained from Rahul's version: Crucial for multi-file upload fields
    multiple: { 
        type: Boolean, 
        default: false 
    }
}, { _id: false }); // Prevents Mongoose from creating unnecessary IDs for every nested field

// 2. Main Schema for an Activity Template
const ActivityTemplateSchema = new Schema({
    // Simple name for the template (e.g., 'National_Hackathon')
    templateName: {
        type: String,
        required: true,
        unique: true, // CRUCIAL: Ensures no two templates have the same name
        trim: true,
    },
    // Broad category for filtering (e.g., 'Technical', 'Cultural')
    templateCategory: {
        type: String,
        required: true,
        trim: true,
    },
    // The array defining the dynamic fields for this activity (uses the schema defined above)
    fields: {
        type: [FieldSchema],
        required: true,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const ActivityTemplate = mongoose.model('ActivityTemplate', ActivityTemplateSchema);
module.exports = ActivityTemplate;

