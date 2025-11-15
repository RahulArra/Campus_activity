const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid submission ID format' });
    }
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
    if (req.user.role === 'student') {
      // If they are a normal user, force the filter to only be for their ID
      filter.userId = req.user.id;
    }
    // If they are an 'admin', they can query any userId (or none to get all)
    // For teachers, filter by their assigned section/year or show their own submissions
    if (req.user.role === 'teacher') {
      if (req.user.assignedSection && req.user.assignedYear) {
        // Teacher is assigned - show submissions from their assigned students
        const teacherFilter = {};
        teacherFilter.section = req.user.assignedSection;
        teacherFilter.year = req.user.assignedYear;
        if (req.user.department) teacherFilter.department = req.user.department;

        // Find students that match the teacher's assignment
        const students = await require('../models/user.model').find({
          role: 'student',
          ...teacherFilter
        }).select('_id');
        const studentIds = students.map(s => s._id);
        filter.userId = { $in: studentIds };
      } else {
        // Teacher is not assigned - show their own submissions like a student
        filter.userId = req.user.id;
      }
    }

    // 3. Find all submissions that match the filter
const submissions = await Submission.find(filter)
  .populate('templateId', 'templateName templateCategory')
  .populate('userId', 'name department email rollNo year section')  // ✅ Added user details
  .sort({ createdAt: -1 });


    res.json(submissions);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Get Teacher's Class Submissions ---
// GET /api/submissions/teacher
router.get('/teacher', authenticateJWT, async (req, res) => {
  try {
    // Only allow teachers
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Only teachers can access this endpoint' });
    }

    // 1. Create a filter object from the query parameters
    const filter = {};
    if (req.query.templateId && req.query.templateId.trim() !== '') {
      // Validate templateId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.query.templateId)) {
        return res.status(400).json({ message: 'Invalid template ID format' });
      }
      filter.templateId = req.query.templateId;
    }
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    // 2. Find students assigned to this teacher
    if (!req.user.assignedSection || !req.user.assignedYear) {
      return res.status(403).json({ message: 'Teacher not assigned to a specific section and year' });
    }
    const teacherFilter = {};
    teacherFilter.section = req.user.assignedSection;
    teacherFilter.year = req.user.assignedYear;
    if (req.user.department) teacherFilter.department = req.user.department;

    let studentsQuery = { role: 'student', ...teacherFilter };
    if (req.query.studentName) {
      studentsQuery.name = { $regex: req.query.studentName, $options: 'i' };
    }

    const students = await require('../models/user.model').find(studentsQuery).select('_id name');
    const studentIds = students.map(s => s._id);

    filter.userId = { $in: studentIds };

    // 3. Find all submissions that match the filter
    const submissions = await Submission.find(filter)
      .populate('templateId', 'templateName templateCategory')
      .populate('userId', 'name department email rollNo year section')
      .sort({ createdAt: -1 });

    res.json({ data: submissions });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Export Teacher's Class Submissions ---
// GET /api/submissions/teacher/export
router.get('/teacher/export', authenticateJWT, async (req, res) => {
  try {
    // Only allow teachers
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Only teachers can access this endpoint' });
    }

    const { format = 'csv', from, to, studentName, templateId } = req.query;

    // 1. Create a filter object from the query parameters
    const filter = {};
    if (templateId) {
      filter.templateId = templateId;
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // 2. Find students assigned to this teacher
    if (!req.user.assignedSection || !req.user.assignedYear) {
      return res.status(403).json({ message: 'Teacher not assigned to a specific section and year' });
    }
    const teacherFilter = {};
    teacherFilter.section = req.user.assignedSection;
    teacherFilter.year = req.user.assignedYear;
    if (req.user.department) teacherFilter.department = req.user.department;

    let studentsQuery = { role: 'student', ...teacherFilter };
    if (studentName) {
      studentsQuery.name = { $regex: studentName, $options: 'i' };
    }

    const students = await require('../models/user.model').find(studentsQuery).select('_id name');
    const studentIds = students.map(s => s._id);

    filter.userId = { $in: studentIds };

    // 3. Find all submissions that match the filter
    const submissions = await Submission.find(filter)
      .populate('templateId', 'templateName templateCategory')
      .populate('userId', 'name department email rollNo year section')
      .sort({ createdAt: -1 });

    if (format.toLowerCase() === 'csv') {
      const csvRows = [
        ['ID', 'Student Name', 'Department', 'Year', 'Roll No', 'Section', 'Activity Type', 'Date', 'Proof Links']
      ];
      submissions.forEach(submission => {
        const proofLinks = (submission.proofs || []).map(proof => `=HYPERLINK("${proof.url}","${proof.filename || 'View Document'}")`).join('\n');
        csvRows.push([
          submission._id.toString().slice(-6),
          submission.userId?.name || 'Unknown',
          submission.userId?.department || 'Unknown',
          submission.userId?.year || 'Unknown',
          submission.userId?.rollNo || 'Unknown',
          submission.userId?.section || 'Unknown',
          submission.templateId?.templateName || 'Unknown',
          new Date(submission.createdAt).toLocaleDateString(),
          proofLinks
        ]);
      });
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const csv = '\uFEFF' + csvRows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=teacher_class_report_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } else if (format.toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=teacher_class_report_${new Date().toISOString().split('T')[0]}.pdf`);

      // Helper functions from report.routes.js
      function drawBorder(doc) {
        const page = doc.page;
        doc.strokeColor('black')
           .lineWidth(1)
           .rect(30, 30, page.width - 60, page.height - 60)
           .stroke();
      }

      function drawHeader(doc) {
        const page = doc.page;
        doc.fillColor('black')
           .font('Helvetica-Bold')
           .fontSize(16)
           .text('Chaitanya Bharathi Institute of Technology', 30, 45, { align: 'center' });

        doc.font('Helvetica')
           .fontSize(10)
           .text('Autonomous educational institution based out of Hyderabad, India', 30, 68, { align: 'center' });

        doc.font('Helvetica-Bold')
           .fontSize(12)
           .text('Teacher Class Report', 30, 90, { align: 'center' });

        doc.moveTo(30, 110)
           .lineTo(page.width - 30, 110)
           .lineWidth(0.5)
           .strokeColor('grey')
           .stroke();
      }

      function drawFooter(doc) {
        const page = doc.page;
        const pageNumber = doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1;

        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('grey')
           .text(`Page ${pageNumber + 1}`,
                30,
                page.height - 45,
                { align: 'right', width: page.width - 60 });
      }

      function drawTableHeader(doc, y) {
        doc.fontSize(9).font('Helvetica-Bold');

        const col1_x = 40;
        const col2_x = 100;
        const col3_x = 180;
        const col4_x = 250;
        const col5_x = 300;
        const col6_x = 340;
        const col7_x = 480;
        const col8_x = 540;

        doc.text('Roll No', col1_x, y, { width: 60 });
        doc.text('Student Name', col2_x, y, { width: 80 });
        doc.text('Department', col3_x, y, { width: 70 });
        doc.text('Year', col4_x, y, { width: 50 });
        doc.text('Section', col5_x, y, { width: 40 });
        doc.text('Activity Type', col6_x, y, { width: 140 });
        doc.text('Date', col7_x, y, { width: 60 });
        doc.text('Proof Links', col8_x, y, { width: 150 });

        const tableBottom = y + doc.heightOfString('X', { width: 60 }) + 3;
        doc.moveTo(col1_x, tableBottom)
           .lineTo(doc.page.width - 40, tableBottom)
           .lineWidth(0.5)
           .strokeColor('black')
           .stroke();

        doc.fillColor('black');
        return tableBottom + 5;
      }

      function drawTableRow(doc, submission, y) {
        doc.fontSize(8).font('Helvetica');

        const col1_x = 40;
        const col2_x = 100;
        const col3_x = 180;
        const col4_x = 250;
        const col5_x = 300;
        const col6_x = 340;
        const col7_x = 480;
        const col8_x = 540;

        doc.text(submission.userId?.rollNo || 'Unknown', col1_x, y, { width: 60 });
        doc.text(submission.userId?.name || 'Unknown', col2_x, y, { width: 80 });
        doc.text(submission.userId?.department || 'Unknown', col3_x, y, { width: 70 });
        doc.text(submission.userId?.year || 'Unknown', col4_x, y, { width: 50 });
        doc.text(submission.userId?.section || 'Unknown', col5_x, y, { width: 40 });
        doc.text(submission.templateId?.templateName || 'Unknown Activity', col6_x, y, { width: 140 });
        doc.text(new Date(submission.createdAt).toLocaleDateString(), col7_x, y, { width: 60 });

        let proofStartY = y;
        (submission.proofs || []).forEach(proof => {
          doc.fillColor('blue')
             .text(proof.filename || 'View Document', col8_x, proofStartY, {
                width: 150,
                link: proof.url,
                underline: true,
                lineBreak: false,
             });
          proofStartY += 12;
        });
        doc.fillColor('black');

        const rowHeight = Math.max(
          doc.heightOfString(submission.templateId?.templateName || 'Unknown', { width: 140 }),
          (proofStartY - y)
        );

        return y + rowHeight + 10;
      }

      doc.on('pageAdded', () => {
        drawBorder(doc);
        drawHeader(doc);
        drawFooter(doc);
      });

      doc.pipe(res);

      drawBorder(doc);
      drawHeader(doc);
      drawFooter(doc);

      let tableTop = 120;
      let rowY = drawTableHeader(doc, tableTop);
      const pageBottom = doc.page.height - 50;

      for (const submission of submissions) {
        if (rowY + 50 > pageBottom) {
          doc.addPage();
          rowY = drawTableHeader(doc, 120);
        }
        rowY = drawTableRow(doc, submission, rowY);
      }

      doc.end();
    } else {
      return res.status(400).json({ message: 'Unsupported format. Use csv or pdf' });
    }

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
      .populate('userId', 'name email department rollNo year section'); // Also get the user's name/email

    // 2. Check if the submission exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 3. Security Check:
    if (req.user.role === 'student') {
      // submission.userId may be populated (object) or an ObjectId. Normalize to string for comparison.
      const ownerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
      }
    }
    // For teachers, check if the submission belongs to their assigned students or their own submissions
    if (req.user.role === 'teacher') {
      const teacherFilter = {};
      if (req.user.assignedSection) teacherFilter.section = req.user.assignedSection;
      if (req.user.assignedYear) teacherFilter.year = req.user.assignedYear;
      if (req.user.department) teacherFilter.department = req.user.department;

      const students = await require('../models/user.model').find({
        role: 'student',
        ...teacherFilter
      }).select('_id');
      const studentIds = students.map(s => s._id.toString());
      const submissionOwnerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();

      // Allow if it's their own submission or from their assigned students
      if (!studentIds.includes(submissionOwnerId) && submissionOwnerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only view submissions from your assigned students or your own submissions' });
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
    if (req.user.role === 'student') {
      const ownerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
      }
    }
    // For teachers, check if the submission belongs to their assigned students or their own submissions
    if (req.user.role === 'teacher') {
      const teacherFilter = {};
      if (req.user.assignedSection) teacherFilter.section = req.user.assignedSection;
      if (req.user.assignedYear) teacherFilter.year = req.user.assignedYear;
      if (req.user.department) teacherFilter.department = req.user.department;

      const students = await require('../models/user.model').find({
        role: 'student',
        ...teacherFilter
      }).select('_id');
      const studentIds = students.map(s => s._id.toString());
      const submissionOwnerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();

      // Allow if it's their own submission or from their assigned students
      if (!studentIds.includes(submissionOwnerId) && submissionOwnerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only edit submissions from your assigned students or your own submissions' });
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
    if (req.user.role === 'student') {
      const ownerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this submission' });
      }
    }
    // For teachers, check if the submission belongs to their assigned students or their own submissions
    if (req.user.role === 'teacher') {
      const teacherFilter = {};
      if (req.user.assignedSection) teacherFilter.section = req.user.assignedSection;
      if (req.user.assignedYear) teacherFilter.year = req.user.assignedYear;
      if (req.user.department) teacherFilter.department = req.user.department;

      const students = await require('../models/user.model').find({
        role: 'student',
        ...teacherFilter
      }).select('_id');
      const studentIds = students.map(s => s._id.toString());
      const submissionOwnerId = submission.userId && submission.userId._id ? submission.userId._id.toString() : submission.userId.toString();

      // Allow if it's their own submission or from their assigned students
      if (!studentIds.includes(submissionOwnerId) && submissionOwnerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only delete submissions from your assigned students or your own submissions' });
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