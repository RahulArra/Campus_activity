const ActivityTemplate = require('../models/activityTemplate.model');

// --- GET All Templates ---
exports.getTemplates = async (req, res) => {
    try {
        const templates = await ActivityTemplate.find({});
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching templates', error: error.message });
    }
};

// --- CREATE Template ---
exports.createTemplate = async (req, res) => {
    try {
        const newTemplate = new ActivityTemplate(req.body);
        await newTemplate.save();
        res.status(201).json({ message: 'Template created successfully!', template: newTemplate });
    } catch (error) {
        res.status(400).json({ message: 'Template creation failed', error: error.message });
    }
};

// --- UPDATE Template --- *** THIS IS THE CRITICAL FUNCTION ***
exports.updateTemplate = async (req, res) => {
    try {
        const templateId = req.params.id; // Get ID from URL parameter
        const updatedTemplate = await ActivityTemplate.findByIdAndUpdate(
            templateId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTemplate) {
            // If ID is valid format but not found in DB
            return res.status(404).json({ message: 'Template not found for update' });
        }
        // Success
        res.status(200).json({ message: 'Template updated successfully!', template: updatedTemplate });
    } catch (error) {
         // Handle potential errors like invalid ID format
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Template ID format' });
         }
        // Other errors (e.g., validation)
        res.status(400).json({ message: 'Template update failed', error: error.message });
    }
};

// --- DELETE Template ---
exports.deleteTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        const result = await ActivityTemplate.findByIdAndDelete(templateId);

        if (!result) {
            return res.status(404).json({ message: 'Template not found for deletion' });
        }
        res.status(200).json({ message: 'Template deleted successfully!' });
    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Template ID format' });
         }
        res.status(500).json({ message: 'Deletion failed', error: error.message });
    }
};