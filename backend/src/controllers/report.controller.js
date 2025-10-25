const ActivitySubmission = require('../models/ActivitySubmission');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

const buildDateRange = (from, to) => {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = dayjs(from).startOf('day').toDate();
  if (to) range.$lte = dayjs(to).endOf('day').toDate();
  return range;
};

const getStudentReport = async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate, page = 1, limit = 50 } = req.query;
  try {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid studentId format' });
    }
    const dateRange = buildDateRange(startDate, endDate);
    const query = { studentId: mongoose.Types.ObjectId(studentId) };
    if (dateRange) query.date = dateRange;

    const docs = await ActivitySubmission.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch student report' });
  }
};

const getActivityReport = async (req, res) => {
  const { templateId } = req.params;
  const { startDate, endDate, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(startDate, endDate);
    const query = { templateId };
    if (dateRange) query.date = dateRange;

    const docs = await ActivitySubmission.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch activity report' });
  }
};

const getDepartmentReport = async (req, res) => {
  const { dept } = req.params;
  const { startDate, endDate, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(startDate, endDate);
    const query = { department: dept };
    if (dateRange) query.date = dateRange;

    const docs = await ActivitySubmission.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch department report' });
  }
};

module.exports = { getStudentReport, getActivityReport, getDepartmentReport };
