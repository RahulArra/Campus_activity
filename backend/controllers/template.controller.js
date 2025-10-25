const ActivityTemplate = require('../models/activityTemplate.model');// Import your model

// --- GET All Templates (Required by Rahul's Dynamic Form Renderer) ---
exports.getTemplates = async (req, res) => {
    try {
        // Fetch all templates for Rahul and Admin UI
        const templates = await ActivityTemplate.find({});
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching templates', error: error.message });
    }
};

// --- CRUD Operations for Admin Panel (Laxman's Requirement) ---

exports.createTemplate = async (req, res) => {
    try {
        const newTemplate = new ActivityTemplate(req.body);
        await newTemplate.save();
        res.status(201).json({ message: 'Template created successfully!', template: newTemplate });
    } catch (error) {
        // Handle validation errors
        res.status(400).json({ message: 'Template creation failed due to validation or server error', error: error.message });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        // Use findByIdAndUpdate for the PUT request
        const updatedTemplate = await ActivityTemplate.findByIdAndUpdate(templateId, req.body, { new: true, runValidators: true });
        
        if (!updatedTemplate) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.status(200).json({ message: 'Template updated successfully!', template: updatedTemplate });
    } catch (error) {
        res.status(400).json({ message: 'Template update failed', error: error.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        const result = await ActivityTemplate.findByIdAndDelete(templateId);
        
        if (!result) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.status(200).json({ message: 'Template deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Deletion failed', error: error.message });
    }
};