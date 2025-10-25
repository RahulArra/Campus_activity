// routes/exports.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/ActivitySubmission');
const verifyToken = require('../middleware/auth');
const { Parser } = require('json2csv');
const dayjs = require('dayjs');

// GET /api/reports/student/:id/export?format=csv
router.get('/student/:id/export', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { format = 'csv', from, to } = req.query;
  if (format !== 'csv') return res.status(400).json({ message: 'Unsupported format for this endpoint' });

  try {
    const dateRange = {};
    if (from) dateRange.$gte = dayjs(from).startOf('day').toDate();
    if (to) dateRange.$lte = dayjs(to).endOf('day').toDate();

    const query = { studentId: id };
    if (Object.keys(dateRange).length) query.date = dateRange;

    const docs = await Activity.find(query).lean();

    const fields = [
      { label: 'Submission ID', value: '_id' },
      { label: 'Student ID', value: 'studentId' },
      { label: 'Student Name', value: 'studentName' },
      { label: 'Title', value: 'title' },
      { label: 'Department', value: 'department' },
      { label: 'Date', value: row => dayjs(row.date).format('YYYY-MM-DD') },
      { label: 'Files', value: row => (row.files || []).map(f => f.url).join('; ') },
      { label: 'Description', value: 'description' },
    ];

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(docs);

    res.header('Content-Type', 'text/csv');
    res.attachment(`student_${id}_report_${dayjs().format('YYYYMMDD')}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate CSV', error: err.message });
  }
});
const eventRoutes = require('./events');
router.use('/', eventRoutes);
module.exports = router;
