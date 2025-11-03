// backend/controllers/export.controller.js
const { Parser } = require('json2csv');
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');
const Submission = require('../models/submission.model'); // Correct: Use Submission model
const User = require('../models/user.model'); // Needed for department filtering
const mongoose = require('mongoose');

// Helper to build date range query part using 'createdAt'
const buildDateRangeQuery = (from, to) => {
    const dateRange = {};
    if (from) dateRange.$gte = dayjs(from).startOf('day').toDate();
    if (to) dateRange.$lte = dayjs(to).endOf('day').toDate();
    return Object.keys(dateRange).length > 0 ? dateRange : null;
};

// --- Export Submissions for a Specific Student as CSV ---
// Example Trigger: GET /api/exports/student/:userId/csv?from=...&to=...
const exportStudentCSV = async (req, res) => {
    const { userId } = req.params; // Corrected: Use userId from params
    const { from, to } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid Student ID format.' });
    }

    try {
        const query = { userId: userId }; // Corrected: Query by userId
        const dateRange = buildDateRangeQuery(from, to);
        if (dateRange) query.createdAt = dateRange; // Corrected: Filter by createdAt

        const docs = await Submission.find(query) // Corrected: Use Submission model
            .populate('userId', 'name department') // Populate user details
            .populate('templateId', 'templateName') // Populate template name
            .sort({ createdAt: -1 })
            .lean();

        const fields = [
            { label: 'Submission ID', value: '_id' },
            { label: 'Student Name', value: row => row.userId?.name || 'Unknown' }, // Corrected: Access populated data
            { label: 'Department', value: row => row.userId?.department || 'N/A' }, // Corrected: Access populated data
            { label: 'Activity Name', value: row => row.templateId?.templateName?.replace(/_/g, ' ') || 'Unknown' }, // Corrected: Access populated data
            { label: 'Status', value: 'status' },
            { label: 'Submission Date', value: row => dayjs(row.createdAt).format('YYYY-MM-DD') }, // Corrected: Use createdAt
            { label: 'Proofs Count', value: row => (row.proofs || []).length },
            { label: 'Remarks', value: 'remarks' }
        ];

        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(docs);

        res.header('Content-Type', 'text/csv');
        res.attachment(`student_${userId}_report_${dayjs().format('YYYYMMDD')}.csv`);
        return res.send(csv);

    } catch (err) {
        console.error("Error generating student CSV:", err);
        return res.status(500).json({ message: 'Failed to generate CSV', error: err.message });
    }
};

// --- Export Submissions for a Department as PDF ---
// Example Trigger: GET /api/exports/department/:dept/pdf?from=...&to=...
const exportDepartmentPDF = async (req, res) => {
    const { dept } = req.params;
    const { from, to } = req.query;

    try {
        const usersInDept = await User.find({ department: dept }, '_id').lean();
        if (usersInDept.length === 0) {
            const html = `<html><body><h2>No users found in department: ${dept}</h2></body></html>`;
            // Generate minimal PDF indicating no data - requires puppeteer setup
        const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });
             const page = await browser.newPage();
             await page.setContent(html, { waitUntil: 'networkidle0' });
             const pdfBuffer = await page.pdf({ format: 'A4' });
             await browser.close();
             res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="empty_report_${dept}.pdf"`,'Content-Length': pdfBuffer.length });
             return res.send(pdfBuffer);
        }
        const userIds = usersInDept.map(user => user._id);

        const query = { userId: { $in: userIds } };
        const dateRange = buildDateRangeQuery(from, to);
        if (dateRange) query.createdAt = dateRange; // Corrected: Use createdAt

        const docs = await Submission.find(query) // Corrected: Use Submission model
            .populate('userId', 'name') // Populate user name
            .populate('templateId', 'templateName') // Populate template name
            .sort({ createdAt: -1 })
            .lean();

        const rowsHtml = docs.map(d => `
          <tr>
            <td>${d._id.toString().slice(-6)}</td>
            <td>${d.userId?.name || 'Unknown'}</td>
            <td>${d.templateId?.templateName?.replace(/_/g, ' ') || 'Unknown'}</td>
            <td>${d.status || 'N/A'}</td>
            <td>${dayjs(d.createdAt).format('YYYY-MM-DD')}</td>
            <td>${(d.proofs || []).length}</td>
          </tr>
        `).join('');

        const html = `
          <html><head><style>body{font-family:Arial,sans-serif;font-size:10px}table{width:100%;border-collapse:collapse;margin-top:15px}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left;word-break:break-word}th{background-color:#f0f0f0;font-weight:bold}h2,p{margin:0 0 5px 0}h2{font-size:16px}p{font-size:10px;color:#555}</style></head>
          <body><h2>Department Activity Report - ${dept}</h2><p>Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}</p>${dateRange ? `<p>Date Range: ${from || 'Start'} to ${to || 'End'}</p>` : ''}<p>Total Submissions: ${docs.length}</p>
          <table><thead><tr><th>ID</th><th>Student</th><th>Activity</th><th>Status</th><th>Date</th><th>Proofs</th></tr></thead>
          <tbody>${rowsHtml}</tbody></table></body></html>`;

        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } });
        await browser.close();

        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="department_${dept}_report_${dayjs().format('YYYYMMDD')}.pdf"`,
          'Content-Length': pdfBuffer.length
        });
        return res.send(pdfBuffer);

    } catch (err) {
        console.error("Error generating department PDF:", err);
        return res.status(500).json({ message: 'Failed to generate PDF', error: err.message });
    }
};

// --- Export General CSV/PDF based on Admin Filters ---
// Connects to AdminSubmissionsView Buttons

const exportFilteredReport = async (req, res, format) => {
    console.log(`--- ENTERING exportFilteredReport for format: ${format} ---`);
    console.log("Query Params Received:", JSON.stringify(req.query));

    const { department, status, templateId, dateRangeFrom, dateRangeTo, studentName } = req.query;

    try {
        console.log("Inside TRY block, preparing filter...");

        // 1. Build Submission Filter
        const submissionFilter = {};

        if (department) {
            console.log("Applying department filter...");
            const usersInDept = await User.find({ department }, '_id').lean();
            const userIds = usersInDept.map(u => u._id);
            submissionFilter.userId = { $in: userIds };
        }

        if (status) {
            submissionFilter.status = status;
        }

        if (templateId) {
            submissionFilter.templateId = templateId;
        }

        if (dateRangeFrom || dateRangeTo) {
            const dateRange = buildDateRangeQuery(dateRangeFrom, dateRangeTo);
            if (dateRange) submissionFilter.createdAt = dateRange;
        }

        if (studentName && req.user?.role === 'admin') {
            console.log("Applying student name filter...");
            const users = await User.find({ name: new RegExp(studentName, 'i') }, '_id').lean();
            const userIds = users.map(u => u._id);
            if (submissionFilter.userId) {
                // Intersect with existing userIds
                submissionFilter.userId.$in = submissionFilter.userId.$in.filter(id => userIds.some(uid => uid.equals(id)));
            } else {
                submissionFilter.userId = { $in: userIds };
            }
        }

        console.log(`Exporting ${format} with final filter:`, JSON.stringify(submissionFilter));

        console.log("Attempting Submission.find()...");
        // 2. Fetch data
        const docs = await Submission.find(submissionFilter)
            .populate('userId', 'name department')
            .populate('templateId', 'templateName')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`Submission.find() successful. Found ${docs.length} documents.`);

        // 3. Generate CSV or PDF based on format
        if (format === 'csv') {
            console.log("Generating CSV...");
            const fields = [
                { label: 'Submission ID', value: '_id' },
                { label: 'Student Name', value: row => row.userId?.name || 'Unknown' },
                { label: 'Department', value: row => row.userId?.department || 'N/A' },
                { label: 'Activity Name', value: row => row.templateId?.templateName?.replace(/_/g, ' ') || 'Unknown' },
                { label: 'Status', value: 'status' },
                { label: 'Submission Date', value: row => dayjs(row.createdAt).format('YYYY-MM-DD') },
                { label: 'Proofs Count', value: row => (row.proofs || []).length },
                { label: 'Remarks', value: 'remarks' }
            ];

            const json2csv = new Parser({ fields });
            const csv = json2csv.parse(docs);

            res.header('Content-Type', 'text/csv');
            res.attachment(`filtered_report_${dayjs().format('YYYYMMDD')}.csv`);
            console.log("CSV generation complete.");
            return res.send(csv);

        } else if (format === 'pdf') {
            console.log("Generating PDF...");
            const rowsHtml = docs.map(d => `
              <tr>
                <td>${d._id.toString().slice(-6)}</td>
                <td>${d.userId?.name || 'Unknown'}</td>
                <td>${d.templateId?.templateName?.replace(/_/g, ' ') || 'Unknown'}</td>
                <td>${d.status || 'N/A'}</td>
                <td>${dayjs(d.createdAt).format('YYYY-MM-DD')}</td>
                <td>${(d.proofs || []).length}</td>
              </tr>
            `).join('');

            const html = `
              <html><head><style>body{font-family:Arial,sans-serif;font-size:10px}table{width:100%;border-collapse:collapse;margin-top:15px}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left;word-break:break-word}th{background-color:#f0f0f0;font-weight:bold}h2,p{margin:0 0 5px 0}h2{font-size:16px}p{font-size:10px;color:#555}</style></head>
              <body><h2>Filtered Activity Report</h2><p>Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}</p><p>Total Submissions: ${docs.length}</p>
              <table><thead><tr><th>ID</th><th>Student</th><th>Activity</th><th>Status</th><th>Date</th><th>Proofs</th></tr></thead>
              <tbody>${rowsHtml}</tbody></table></body></html>`;

            console.log("Launching Puppeteer...");
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            console.log("Puppeteer page created. Setting content...");
            await page.setContent(html, { waitUntil: 'networkidle0' });
            console.log("Generating PDF buffer...");
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } });
            console.log("PDF buffer generated. Closing browser...");
            await browser.close();
            console.log("PDF generation complete.");
            res.set({
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="filtered_report_${dayjs().format('YYYYMMDD')}.pdf"`,
              'Content-Length': pdfBuffer.length
            });
            return res.send(pdfBuffer);
        } else {
            console.log("Unsupported format requested.");
            return res.status(400).json({ message: 'Unsupported format requested' });
        }

    } catch (err) {
        console.error(`!!! ERROR generating filtered ${format} report:`, err);
        return res.status(500).json({ message: `Failed to generate ${format} report`, error: err.message });
    }
};

// ... (rest of the controller code and module.exports) ...

module.exports = {
    exportStudentCSV,
    exportDepartmentPDF,
    exportFilteredReport // Export the new function
};