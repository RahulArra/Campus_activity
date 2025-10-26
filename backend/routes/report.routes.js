// routes/reports.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/ActivitySubmission');
const { authenticateJWT: verifyToken } = require('../middleware/auth.middleware.js');
const dayjs = require('dayjs');

// Helper to build date filter
function buildDateRange(from, to) {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = dayjs(from).startOf('day').toDate();
  if (to) range.$lte = dayjs(to).endOf('day').toDate();
  return range;
}

// GET /api/reports/student/:studentId
router.get('/student/:studentId', verifyToken, async (req, res) => {
  const { studentId } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = { studentId };
    if (dateRange) query.date = dateRange;

    const docs = await Activity.find(query)
      .sort({ date: -1 })
      .skip((page-1)*limit)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch student report' });
  }
});

// GET /api/reports/activity/:templateId
router.get('/activity/:templateId', verifyToken, async (req, res) => {
  const { templateId } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = { templateId };
    if (dateRange) query.date = dateRange;

    const docs = await Activity.find(query).sort({ date: -1 }).skip((page-1)*limit).limit(parseInt(limit)).lean();
    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch activity report' });
  }
});

// GET /api/reports/department/:dept
router.get('/department/:dept', verifyToken, async (req, res) => {
  const { dept } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = { department: dept };
    if (dateRange) query.date = dateRange;

    const docs = await Activity.find(query).sort({ date: -1 }).skip((page-1)*limit).limit(parseInt(limit)).lean();
    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch department report' });
  }
});

module.exports = router;
