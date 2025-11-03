// backend/routes/export.routes.js
const express = require('express');
const router = express.Router();
// Import the corrected controller functions
const exportController = require('../controllers/export.controller');
// Import middleware for security
const { authenticateJWT } = require('../middleware/auth.middleware.js');
// Import ROLE middleware if available and needed
// const { authorizeRole } = require('../middleware/auth.middleware.js');

// --- Routes for Exporting Report Data ---
// Note: These endpoints trigger file downloads.

// GET /api/exports/student/:userId/csv - Export specific student's data as CSV
// Expects dateRangeFrom/dateRangeTo query params
router.get('/student/:userId/csv', authenticateJWT, exportController.exportStudentCSV);

// GET /api/exports/department/:dept/pdf - Export specific department's data as PDF
// Potentially restrict to admins later
// Expects dateRangeFrom/dateRangeTo query params
router.get('/department/:dept/pdf', authenticateJWT, /* authorizeRole(['admin']), */ exportController.exportDepartmentPDF);

// --- Routes for General Filtered Exports (Connects to AdminSubmissionsView Buttons) ---

// GET /api/exports/csv?filterParams... - Export filtered data based on query params as CSV
// Matches frontend call: axios.get(`/api/exports/csv`, { params: filters... })
router.get('/csv', authenticateJWT, (req, res) => {
    console.log('CSV export route hit with query:', req.query);
    // Pass the format 'csv' to the shared controller function
    exportController.exportFilteredReport(req, res, 'csv');
});

// GET /api/exports/pdf?filterParams... - Export filtered data based on query params as PDF
// Matches frontend call: axios.get(`/api/exports/pdf`, { params: filters... })
router.get('/pdf', authenticateJWT, (req, res) => {
    console.log('PDF export route hit with query:', req.query);
    // Pass the format 'pdf' to the shared controller function
    exportController.exportFilteredReport(req, res, 'pdf');
});

// Remove unrelated event routes if they were mistakenly included
// const eventRoutes = require('./events'); // Remove if not needed
// router.use('/', eventRoutes);        // Remove if not needed

module.exports = router;