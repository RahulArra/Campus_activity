const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const { authenticateJWT } = require('../middleware/auth.middleware.js');
// const { authorizeRole } = require('../middleware/auth.middleware.js'); // Add when ready

// --- Template Routes ---

router.route('/')
    .get(templateController.getTemplates) // GET /api/templates
    .post(authenticateJWT, /* authorizeRole(['admin']), */ templateController.createTemplate); // POST /api/templates

// --- Routes for specific ID --- *** THIS DEFINES THE PUT ROUTE ***
router.route('/:id')
    // PUT /api/templates/:id
    .put(authenticateJWT, /* authorizeRole(['admin']), */ templateController.updateTemplate)
    // DELETE /api/templates/:id
    .delete(authenticateJWT, /* authorizeRole(['admin']), */ templateController.deleteTemplate);

module.exports = router;