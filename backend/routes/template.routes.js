const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller'); // Import your new controller!

// --- Template CRUD Routes (Required by Laxman's Admin Panel) ---

// Route for fetching all templates and creating new ones
router.route('/')
    // GET /api/templates: Fetch all templates (Used by Rahul's Dynamic Forms)
    .get(templateController.getTemplates) 
    // POST /api/templates: Create new template (Used by Admin Template CRUD UI)
    .post(templateController.createTemplate); 

// Route for operations on a specific template ID
router.route('/:id')
    // PUT /api/templates/:id: Update existing template (Used by Admin Template CRUD UI)
    .put(templateController.updateTemplate) 
    // DELETE /api/templates/:id: Delete template (Used by Admin Template CRUD UI)
    .delete(templateController.deleteTemplate); 

module.exports = router;