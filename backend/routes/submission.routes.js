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
// --- Get Submissions (Refined Filtering for Admin & User) ---
// GET /api/submissions
router.get('/', authenticateJWT, async (req, res) => {
  // Log incoming request details for debugging
  console.log(`GET /api/submissions - User Role: ${req.user.role}, Query Params: ${JSON.stringify(req.query)}`);

  try {
    // 1. Initialize filter object for the Submission collection
    const submissionFilter = {};
    let usersToFilterBy = null; // Used only if admin filters by department

    // --- Handle Department Filter (Admin Only) ---
    // If the logged-in user is an admin AND they provided a department filter
    if (req.user.role === 'admin' && req.query.department) {
      console.log(`Admin is filtering by department: ${req.query.department}`);
      try {
        // Find the ObjectIDs (_id) of all users matching that department
        const usersInDept = await User.find({ department: req.query.department }, '_id').lean(); // Use .lean() for plain JS objects
        if (usersInDept.length > 0) {
          // Store the array of user IDs
          usersToFilterBy = usersInDept.map(user => user._id);
          console.log(`Found ${usersToFilterBy.length} users in department ${req.query.department}`);
        } else {
          // If no users found in that department, we know there are no submissions to return
          console.log(`No users found for department filter: ${req.query.department}. Returning empty array.`);
          return res.json([]); // Return empty results immediately
        }
      } catch (userErr) {
        console.error("Error filtering users by department:", userErr);
        // Fallback: If user lookup fails, proceed without the department filter
        // Consider returning an error or just logging it. We'll proceed for now.
      }
    }

    // --- Build the rest of the submissionFilter ---
    if (req.query.templateId) {
      submissionFilter.templateId = req.query.templateId;
    }
    if (req.query.status && req.query.status !== 'All') {
      submissionFilter.status = req.query.status;
    }
    // Date range filtering
     if (req.query.dateRangeFrom || req.query.dateRangeTo) {
         submissionFilter.createdAt = {};
         if (req.query.dateRangeFrom) {
             submissionFilter.createdAt.$gte = new Date(req.query.dateRangeFrom);
         }
         if (req.query.dateRangeTo) {
             let endDate = new Date(req.query.dateRangeTo);
             endDate.setHours(23, 59, 59, 999);
             submissionFilter.createdAt.$lte = endDate;
         }
     }

    // --- Apply Security / User Filter ---
    if (req.user.role === 'user') {
      // REGULAR USER: Force filter to only their own submissions
      console.log(`User role detected. Forcing filter to userId: ${req.user.id}`);
      submissionFilter.userId = req.user.id;
    } else if (req.user.role === 'admin') {
      // ADMIN: Apply department filter ONLY if users were found
      if (usersToFilterBy) {
        submissionFilter.userId = { $in: usersToFilterBy };
      }
      // If admin AND no department filter, submissionFilter.userId remains unset,
      // correctly allowing results from ALL users.
      console.log("Admin role detected. Applying general filters.");
    }

    // Log the final filter being sent to MongoDB
    console.log("Executing Submission.find() with filter:", JSON.stringify(submissionFilter));

    // 4. Find submissions matching the final filter object
    const submissions = await Submission.find(submissionFilter)
      .populate('templateId', 'templateName templateCategory') // Populate template info
      .populate('userId', 'name department') // <<<--- Populate user info ---<<<
      .sort({ createdAt: -1 }); // Sort newest first

    console.log(`Query successful. Found ${submissions.length} submissions.`);
    // Log the structure of the first result to verify population
    // if (submissions.length > 0) {
    //   console.log("Sample submission data after populate:", JSON.stringify(submissions[0], null, 2));
    // }

    res.json(submissions); // Send the results

  } catch (error) {
    console.error("Error fetching submissions:", error); // Log the full error stack
    res.status(500).json({ message: 'Server error fetching submissions', error: error.message });
  }
});
// --- Get a Single Submission by its ID ---
// GET /api/submissions/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    // 1. Find the submission by its ID from the URL parameters
    const submission = await Submission.findById(req.params.id)
      .populate('templateId', 'templateName templateCategory')
      .populate('userId', 'name email department'); // Also get the user's name/email

    // 2. Check if the submission exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 3. Security Check:
    if (req.user.role === 'user' && submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
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
    if (req.user.role === 'user' && submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
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
    if (req.user.role === 'user' && submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
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