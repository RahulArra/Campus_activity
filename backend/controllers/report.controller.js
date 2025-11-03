// backend/controllers/report.controller.js
const Submission = require('../models/submission.model'); // Correct: Use Submission model
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const User = require('../models/user.model');

// Helper to build date range query using 'createdAt'
const buildDateRangeQuery = (from, to) => {
    if (!from && !to) return null;
    const range = {};
    if (from) range.$gte = dayjs(from).startOf('day').toDate();
    if (to) range.$lte = dayjs(to).endOf('day').toDate();
    return range;
};

// --- Get Report for a Specific Student ---
// Example Trigger: GET /api/reports/student/:userId?startDate=...&endDate=...
const getStudentReport = async (req, res) => {
    const { userId } = req.params; // Corrected: Use userId
    // Corrected: use dateRangeFrom, dateRangeTo to match Admin UI query params
    const { dateRangeFrom, dateRangeTo, page = 1, limit = 50 } = req.query;
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid student ID format' });
        }
        const dateRange = buildDateRangeQuery(dateRangeFrom, dateRangeTo);
        const query = { userId: userId }; // Corrected: Query by userId
        if (dateRange) {
            query.createdAt = dateRange; // Corrected: Filter by createdAt
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const totalDocs = await Submission.countDocuments(query);
        const docs = await Submission.find(query) // Corrected: Use Submission
            .populate('userId', 'name department')
            .populate('templateId', 'templateName')
            .sort({ createdAt: -1 }) // Corrected: Sort by createdAt
            .skip(skip)
            .limit(parseInt(limit, 10))
            .lean();

         return res.status(200).json({
             docs: docs, totalDocs: totalDocs, limit: parseInt(limit, 10),
             page: parseInt(page, 10), totalPages: Math.ceil(totalDocs / parseInt(limit, 10)),
         });

    } catch (err) {
        console.error("Error fetching student report:", err);
        return res.status(500).json({ message: 'Failed to fetch student report' });
    }
};

// --- Get Report for a Specific Activity Type ---
// Example Trigger: GET /api/reports/activity/:templateId?startDate=...&endDate=...
const getActivityReport = async (req, res) => {
    const { templateId } = req.params;
    const { dateRangeFrom, dateRangeTo, page = 1, limit = 50 } = req.query; // Corrected date names
    try {
         if (!mongoose.Types.ObjectId.isValid(templateId)) {
            return res.status(400).json({ message: 'Invalid template ID format' });
        }
        const dateRange = buildDateRangeQuery(dateRangeFrom, dateRangeTo);
        const query = { templateId: templateId };
        if (dateRange) {
            query.createdAt = dateRange; // Corrected: Filter by createdAt
        }

         const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
         const totalDocs = await Submission.countDocuments(query);
         const docs = await Submission.find(query) // Corrected: Use Submission
            .populate('userId', 'name department')
            .populate('templateId', 'templateName')
            .sort({ createdAt: -1 }) // Corrected: Sort by createdAt
            .skip(skip)
            .limit(parseInt(limit, 10))
            .lean();

         return res.status(200).json({
             docs: docs, totalDocs: totalDocs, limit: parseInt(limit, 10),
             page: parseInt(page, 10), totalPages: Math.ceil(totalDocs / parseInt(limit, 10)),
         });

    } catch (err) {
        console.error("Error fetching activity report:", err);
        return res.status(500).json({ message: 'Failed to fetch activity report' });
    }
};

// --- Get Report for a Specific Department ---
// Example Trigger: GET /api/reports/department/:dept?startDate=...&endDate=...
const getDepartmentReport = async (req, res) => {
    const { dept } = req.params;
    const { dateRangeFrom, dateRangeTo, page = 1, limit = 50 } = req.query; // Corrected date names
    try {
        const usersInDept = await User.find({ department: dept }, '_id').lean();
        if (usersInDept.length === 0) {
            return res.status(200).json({ docs: [], totalDocs: 0, limit: parseInt(limit, 10), page: parseInt(page, 10), totalPages: 0 });
        }
        const userIds = usersInDept.map(user => user._id);

        const dateRange = buildDateRangeQuery(dateRangeFrom, dateRangeTo);
        const query = { userId: { $in: userIds } };
        if (dateRange) {
            query.createdAt = dateRange; // Corrected: Filter by createdAt
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const totalDocs = await Submission.countDocuments(query);
        const docs = await Submission.find(query) // Corrected: Use Submission
            .populate('userId', 'name department')
            .populate('templateId', 'templateName')
            .sort({ createdAt: -1 }) // Corrected: Sort by createdAt
            .skip(skip)
            .limit(parseInt(limit, 10))
            .lean();

         return res.status(200).json({
             docs: docs, totalDocs: totalDocs, limit: parseInt(limit, 10),
             page: parseInt(page, 10), totalPages: Math.ceil(totalDocs / parseInt(limit, 10)),
         });

    } catch (err) {
        console.error("Error fetching department report:", err);
        return res.status(500).json({ message: 'Failed to fetch department report' });
    }
};

module.exports = { getStudentReport, getActivityReport, getDepartmentReport };