// append to routes/exports.js or separate file
const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer-core'); // <-- MUST BE 'puppeteer-core'
const chromium = require('@sparticuz/chromium');
const dayjs = require('dayjs');
const Activity = require('../models/ActivitySubmission');
const { authenticateJWT: verifyToken } = require('../middleware/auth.middleware.js');
const { Parser } = require('json2csv');

// GET /api/reports/department/:dept/export?format=csv or pdf
router.get('/department/:dept/export', verifyToken, async (req, res) => {
  const { dept } = req.params;
  const { format = 'pdf', startDate, endDate } = req.query;
  if (!['csv', 'pdf'].includes(format)) return res.status(400).json({ message: 'Unsupported format. Use csv or pdf' });

  try {
    const dateRange = {};
    if (startDate) dateRange.$gte = dayjs(startDate).startOf('day').toDate();
    if (endDate) dateRange.$lte = dayjs(endDate).endOf('day').toDate();

    const query = { department: dept };
    if (Object.keys(dateRange).length) query.date = dateRange;

    const docs = await Activity.find(query).lean();

    if (format === 'csv') {
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

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="department_${dept}_report_${dayjs().format('YYYYMMDD')}.csv"`
      });
      return res.send(csv);
    } else if (format === 'pdf') {
      // Create an HTML template for PDF
      const rowsHtml = docs.map(d => `
        <tr>
          <td>${d._id}</td>
          <td>${d.studentName || ''}</td>
          <td>${d.title || ''}</td>
          <td>${d.templateId || ''}</td>
          <td>${dayjs(d.date).format('YYYY-MM-DD')}</td>
          <td>${(d.files || []).map(f => `<a href="${f.url}">file</a>`).join(', ')}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
              th { background: #f5f5f5; }
            </style>
          </head>
          <body>
            <h2>Department Report - ${dept}</h2>
            <p>Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}</p>
            <table>
              <thead>
                <tr><th>ID</th><th>Student</th><th>Title</th><th>Template</th><th>Date</th><th>Files</th></tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </body>
        </html>
      `;

      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="department_${dept}_report_${dayjs().format('YYYYMMDD')}.pdf"`,
        'Content-Length': pdfBuffer.length
      });
      return res.send(pdfBuffer);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate export', error: err.message });
  }
});
module.exports = router;
