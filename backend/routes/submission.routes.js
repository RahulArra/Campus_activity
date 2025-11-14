const express = require('express');
const router = express.Router();
const Submission = require('../models/submission.model');
const { authenticateJWT } = require('../middleware/auth.middleware.js');

// --- Create a new Submission ---
// POST /api/submissions
// We add "authenticateJWT" as middleware. This function will run *before* the (req, res) logic.
router.post('/', authenticateJWT, async (req, res) => {
  try {
    // 2. Get the form data from the request body
    const { templateId, data, proofs } = req.body;

    // 3. Get the user's ID from the middleware (req.user.id)
    const userId = req.user.id;

    // 4. Create a new submission instance
    const newSubmission = new Submission({
      userId,
      templateId,
      data,
      proofs, // This will come from Shravan's file upload API
      status: 'submitted'
    });

    // 5. Save the submission to the database
    const savedSubmission = await newSubmission.save();

    res.status(201).json({ message: 'Submission created successfully!', submission: savedSubmission });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// --- Get Submissions (for the dashboard) ---
// GET /api/submissions
// This route now supports filtering by query parameters like ?userId=...
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // 1. Create a filter object from the query parameters
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.templateId) {
      filter.templateId = req.query.templateId;
    }
    
    // 2. Security Check: Make sure a normal user can only get their *own* submissions
    if (req.user.role === 'user') {
      // If they are a normal user, force the filter to only be for their ID
      filter.userId = req.user.id;
    }
    // If they are an 'admin', they can query any userId (or none to get all)

    // 3. Find all submissions that match the filter
const submissions = await Submission.find(filter)
  .populate('templateId', 'templateName templateCategory')
  .populate('userId', 'name department email rollno')  // ✅ Added user details
  .sort({ createdAt: -1 });


    res.json(submissions);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// --- Get a Single Submission by its ID ---
// GET /api/submissions/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    // 1. Find the submission by its ID from the URL parameters
    const submission = await Submission.findById(req.params.id)
      .populate('templateId', 'templateName templateCategory')
      .populate('userId', 'name email department rollno'); // Also get the user's name/email

    // 2. Check if the submission exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 3. Security Check:
    if (req.user.role === 'user') {
      // submission.userId may be populated (object) or an ObjectId. Normalize to string for comparison.
      const ownerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
      }
    }

    // 4. If they are an 'admin' or they own it, send the data
    res.json(submission);

  } catch (error) {
    // This catches errors like an invalid MongoDB ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid submission ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// --- Update a Submission by its ID ---
// PUT /api/submissions/:id
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    // 1. Get the new data from the request body
    const { data, proofs, status } = req.body;

    // 2. Find the submission by ID first
    let submission = await Submission.findById(req.params.id);

    // 3. Check if it exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 4. Security Check: Only the owner or an admin can edit
    if (req.user.role === 'user') {
      const ownerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
      }
    }

    // 5. Update the fields
    if (data) submission.data = data;
    if (proofs) submission.proofs = proofs;
    
    // Only an admin should be able to change the status (e.g., to 'approved')
    if (status) {
      if (req.user.role === 'admin') {
        submission.status = status;
      } else if (status === 'draft') {
        submission.status = 'draft'; 
      }
    }

    // 6. Save the updated submission
    const updatedSubmission = await submission.save();

    res.json({ message: 'Submission updated successfully!', submission: updatedSubmission });

  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid submission ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// --- Delete a Submission by its ID ---
// DELETE /api/submissions/:id
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // 1. Find the submission by ID first
    let submission = await Submission.findById(req.params.id);

    // 2. Check if it exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 3. Security Check: Only the owner or an admin can delete
    if (req.user.role === 'user') {
      const ownerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
      }
    }

    // 4. Delete the submission
    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Submission deleted successfully!' });

  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid submission ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;