// backend/routes/report.routes.js
const express = require('express');
const router = express.Router();
// Import the corrected controller functions
const reportController = require('../controllers/report.controller');
// Import middleware for security
const { authenticateJWT } = require('../middleware/auth.middleware.js');
// Import ROLE middleware if available and needed (e.g., only admins can see dept reports)
// const { authorizeRole } = require('../middleware/auth.middleware.js');

// --- Routes for Fetching Report Data ---
// Note: These endpoints return JSON data, not files.

// GET /api/reports/student/:userId - Fetch submissions for a specific student
// Uses userId parameter and expects dateRangeFrom/dateRangeTo query params
router.get('/student/:userId', authenticateJWT, reportController.getStudentReport);

// GET /api/reports/activity/:templateId - Fetch submissions for a specific activity type
// Expects dateRangeFrom/dateRangeTo query params
router.get('/activity/:templateId', authenticateJWT, reportController.getActivityReport);

// GET /api/reports/department/:dept - Fetch submissions for a specific department
// Potentially restrict this to admins using authorizeRole(['admin']) later
// Expects dateRangeFrom/dateRangeTo query params
router.get('/department/:dept', authenticateJWT, /* authorizeRole(['admin']), */ reportController.getDepartmentReport);


module.exports = router;