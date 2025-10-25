const ActivitySubmission = require('../models/ActivitySubmission');
const { Parser } = require('json2csv');
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');

const exportStudentCSV = async (req, res) => {
  const { id } = req.params;
  const { format = 'csv', from, to } = req.query;
  if (format !== 'csv') return res.status(400).json({ message: 'Unsupported format for this endpoint' });

  try {
    const dateRange = {};
    if (from) dateRange.$gte = dayjs(from).startOf('day').toDate();
    if (to) dateRange.$lte = dayjs(to).endOf('day').toDate();

    const query = { studentId: id };
    if (Object.keys(dateRange).length) query.date = dateRange;

    const docs = await ActivitySubmission.find(query).lean();

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
};

const exportDepartmentPDF = async (req, res) => {
  const { dept } = req.params;
  const { format = 'pdf', from, to } = req.query;
  if (format !== 'pdf') return res.status(400).json({ message: 'Unsupported format' });

  try {
    const dateRange = {};
    if (from) dateRange.$gte = dayjs(from).startOf('day').toDate();
    if (to) dateRange.$lte = dayjs(to).endOf('day').toDate();

    const query = { department: dept };
    if (Object.keys(dateRange).length) query.date = dateRange;

    const docs = await ActivitySubmission.find(query).lean();

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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate PDF', error: err.message });
  }
};

module.exports = { exportStudentCSV, exportDepartmentPDF };
