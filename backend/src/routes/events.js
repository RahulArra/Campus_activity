// append to routes/exports.js or separate file
const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const Activity = require('../models/ActivitySubmission');
const verifyToken = require('../middleware/auth');

// GET /api/reports/department/:dept/export?format=pdf
router.get('/department/:dept/export', verifyToken, async (req, res) => {
  const { dept } = req.params;
  const { format = 'pdf', from, to } = req.query;
  if (format !== 'pdf') return res.status(400).json({ message: 'Unsupported format' });

  try {
    const dateRange = {};
    if (from) dateRange.$gte = dayjs(from).startOf('day').toDate();
    if (to) dateRange.$lte = dayjs(to).endOf('day').toDate();

    const query = { department: dept };
    if (Object.keys(dateRange).length) query.date = dateRange;

    const docs = await Activity.find(query).lean();

    // Create an HTML template for PDF
    const rowsHtml = docs.map(d => `
      <tr>
        <td>${d._id}</td>
        <td>${d.studentName || ''}</td>
        <td>${d.title || ''}</td>
        <td>${d.templateId || ''}</td>
        <td>${dayjs(d.date).format('YYYY-MM-DD')}</td>
        <td>${(d.files||[]).map(f=>`<a href="${f.url}">file</a>`).join(', ')}</td>
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate PDF', error: err.message });
  }
});
module.exports = router;