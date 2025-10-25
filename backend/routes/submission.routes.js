const express = require('express');
const router = express.Router();
// IMPORTANT: This 'require' links the routes to the controller logic file you just created.
const submissionController = require('../controllers/submission.controller'); 
// We assume authentication middleware will be added here later by Naveen

// --- Core Submission Routes ---

router.route('/')
    // POST /api/submissions: Student submits activity (Used by Rahul's Form UI)
    // This starts the core application flow.
    .post(submissionController.submitActivity) 
    
    // GET /api/submissions: Retrieve filtered list (Used by Shiva's Dashboard and Laxman's Admin View)
    .get(submissionController.getSubmissions); 

// --- Verification/Workflow Route (Admin Requirement) ---

router.route('/:id/status')
    // PUT /api/submissions/:id/status: Update status (Admin/Faculty action)
    // This handles the Approve/Reject workflow.
    .put(submissionController.updateSubmissionStatus);

// --- Additional CRUD routes for completeness ---

router.route('/:id')
    // GET /api/submissions/:id: View single submission detail
    .get(submissionController.getSubmissionDetails) 
    // DELETE /api/submissions/:id: Delete a draft submission (optional)
    .delete(submissionController.deleteSubmission); 

module.exports = router;
