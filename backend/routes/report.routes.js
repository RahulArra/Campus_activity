const express = require('express');
const router = express.Router();
const Activity = require('../models/submission.model.js');
const User = require('../models/user.model.js');
const { authenticateJWT: verifyToken } = require('../middleware/auth.middleware.js');
const dayjs = require('dayjs');
const PDFDocument = require('pdfkit');

// Helper to build date filter
function buildDateRange(from, to) {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = dayjs(from).startOf('day').toDate();
  if (to) range.$lte = dayjs(to).endOf('day').toDate();
  return range;
}

// --- PDF HELPER FUNCTIONS ---

// Draws the border on any page
function drawBorder(doc) {
  const page = doc.page;
  doc.strokeColor('black')
     .lineWidth(1)
     .rect(30, 30, page.width - 60, page.height - 60)
     .stroke();
}

// --- MODIFIED: drawHeader now accepts 'dept' ---
function drawHeader(doc, dept) {
  const page = doc.page;
  doc.fillColor('black')
     .font('Helvetica-Bold')
     .fontSize(16)
     .text('Chaitanya Bharathi Institute of Technology', 30, 45, { align: 'center' });
  
  doc.font('Helvetica')
     .fontSize(10)
     .text('Autonomous educational institution based out of Hyderabad, India', 30, 68, { align: 'center' });
     
  // --- ADDED: Department Name ---
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .text(`Department Report - ${dept.toUpperCase()}`, 30, 90, { align: 'center' });

  doc.moveTo(30, 110) // Moved line down
     .lineTo(page.width - 30, 110)
     .lineWidth(0.5)
     .strokeColor('grey')
     .stroke();
}

// Draws the footer (with page number) on any page
function drawFooter(doc) {
  const page = doc.page;
  // This logic correctly gets the current page number
  const pageNumber = doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1;

  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('grey')
     .text(`Page ${pageNumber + 1}`, // page numbers are 0-indexed
          30, 
          page.height - 45, 
          { align: 'right', width: page.width - 60 });
}

// Draws the static header for the table
function drawTableHeader(doc, y) {
  doc.fontSize(9).font('Helvetica-Bold');
  
  const col1_x = 40;
  const col2_x = 100;
  const col3_x = 190;
  const col4_x = 260;
  const col5_x = 390;
  const col6_x = 450;
  const col7_x = 510;
  const col8_x = 660;

  doc.text('Roll No', col1_x, y, { width: 60 });
  doc.text('Student Name', col2_x, y, { width: 90 });
  doc.text('Department', col3_x, y, { width: 70 });
  doc.text('Activity Type', col4_x, y, { width: 130 });
  doc.text('Start Date', col5_x, y, { width: 60 });
  doc.text('End Date', col6_x, y, { width: 60 });
  doc.text('Proof Links', col7_x, y, { width: 150 });
  doc.text('Status', col8_x, y, { width: 60 });
  
  const tableBottom = y + doc.heightOfString('X', { width: 60 }) + 3;
  doc.moveTo(col1_x, tableBottom)
     .lineTo(doc.page.width - 40, tableBottom)
     .lineWidth(0.5)
     .strokeColor('black')
     .stroke();
     
  doc.fillColor('black');
  return tableBottom + 5;
}

// Draws a single row in the table
function drawTableRow(doc, activity, y) {
  doc.fontSize(8).font('Helvetica');

  const col1_x = 40;
  const col2_x = 100;
  const col3_x = 190;
  const col4_x = 260;
  const col5_x = 390;
  const col6_x = 450;
  const col7_x = 510;
  const col8_x = 660;
  
  const activityData = activity.data || {};
  const endDate = activityData.endDate || activityData.completionDate || '';

  doc.text(activity.userId?.rollno || 'Unknown', col1_x, y, { width: 60 });
  doc.text(activity.userId?.name || 'Unknown', col2_x, y, { width: 90 });
  doc.text(activity.department || activity.userId?.department || 'Unknown', col3_x, y, { width: 70 });
  doc.text(activity.templateId?.templateName || 'Unknown Activity', col4_x, y, { width: 130 });
  doc.text(new Date(activity.createdAt).toLocaleDateString(), col5_x, y, { width: 60 });
  doc.text(endDate ? new Date(endDate).toLocaleDateString() : '', col6_x, y, { width: 60 });
  doc.text(activity.status || '', col8_x, y, { width: 60 });

  let proofStartY = y;
  (activity.proofs || []).forEach(proof => {
    doc.fillColor('blue')
       .text(proof.filename || 'View Document', col7_x, proofStartY, {
          width: 150,
          link: proof.url,
          underline: true,
          lineBreak: false,
       });
    proofStartY += 12;
  });
  doc.fillColor('black');

  const rowHeight = Math.max(
    doc.heightOfString(activity.templateId?.templateName || 'Unknown', { width: 130 }),
    (proofStartY - y)
  );

  return y + rowHeight + 10;
}

// --- API ROUTES ---

// (Unchanged JSON routes)
router.get('/student/:studentId', verifyToken, async (req, res) => {
  const { studentId } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = { studentId };
    if (dateRange) query.date = dateRange;
    const docs = await Activity.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean();
    const total = await Activity.countDocuments(query);
    return res.status(200).json({ total, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch student report' });
  }
});

router.get('/activity/:templateId', verifyToken, async (req, res) => {
  const { templateId } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = { templateId };
    if (dateRange) query.date = dateRange;
    const docs = await Activity.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).lean();
    const total = await Activity.countDocuments(query);
    return res.status(200).json({ total, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch activity report' });
  }
});

router.get('/department/:dept', verifyToken, async (req, res) => {
  const { dept } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const userQuery = { department: new RegExp(`^${dept}$`, 'i') };
    const usersInDept = await User.find(userQuery).select('_id').lean();
    const userIds = usersInDept.map(u => u._id);
    const query = {
      $or: [{ userId: { $in: userIds } }, { department: new RegExp(`^${dept}$`, 'i') }]
    };
    if (dateRange) query.createdAt = dateRange;
    const docs = await Activity.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).populate('userId', 'name department rollno').lean();
    const total = await Activity.countDocuments(query);
    return res.status(200).json({ total, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch department report' });
  }
});


// --- EXPORT ROUTE ---
router.get('/department/:dept/export', verifyToken, async (req, res) => {
  const { dept } = req.params;
  const { format = 'pdf', from, to } = req.query;
  
  try {
    // 1. Get Data
    const dateRange = buildDateRange(from, to);
    const userQuery = { department: new RegExp(`^${dept}$`, 'i') };
    const usersInDept = await User.find(userQuery).select('_id').lean();
    const userIds = usersInDept.map(u => u._id);
    const query = {
      $or: [{ userId: { $in: userIds } }, { department: new RegExp(`^${dept}$`, 'i') }]
    };
    if (dateRange) query.createdAt = dateRange;

    let activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .populate('templateId', 'templateName')
      .populate('userId', 'name department rollno')
      .lean();

    console.log(`Export: found ${activities.length} activities for department=${dept}`);

    if (format.toLowerCase() === 'csv') {
      // 2. CSV Logic (Unchanged)
      const csvRows = [
        ['Roll No', 'Student Name', 'Department', 'Activity Type', 'Start Date', 'End Date', 'Proof Links', 'Status']
      ];
      activities.forEach(activity => {
        const proofLinks = (activity.proofs || []).map(proof => `=HYPERLINK("${proof.url}","${proof.filename || 'View Document'}")`).join('\n');
        const activityData = activity.data || {};
        const endDate = activityData.endDate || activityData.completionDate || '';
        csvRows.push([
          activity.userId?.rollno || 'Unknown', 
          activity.userId?.name || 'Unknown',
          activity.department || activity.userId?.department || 'Unknown',
          activity.templateId?.templateName || 'Unknown Activity',
          new Date(activity.createdAt).toLocaleDateString(),
          endDate ? new Date(endDate).toLocaleDateString() : '',
          proofLinks,
          activity.status || ''
        ]);
      });
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const csv = '\uFEFF' + csvRows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=department_${dept}_report.csv`);
      return res.send(csv);

    } else {
      // 3. PDFKIT TEMPLATE LOGIC
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=department_${dept}_report.pdf`);
      
      const doc = new PDFDocument({ 
        margin: 30, 
        size: 'A4', 
        layout: 'landscape'
      });
      
      // --- MODIFIED: Pass 'dept' to the header on new pages ---
      doc.on('pageAdded', () => {
        drawBorder(doc);
        drawHeader(doc, dept); // <-- Pass dept
        drawFooter(doc);
      });
      
      doc.pipe(res);
      
      // --- Draw Page 1 Template ---
      drawBorder(doc);
      drawHeader(doc, dept); // <-- Pass dept
      drawFooter(doc);
      
      // --- Draw Table Content ---
      let tableTop = 120; // <-- Adjusted start position for table
      let rowY = drawTableHeader(doc, tableTop);
      const pageBottom = doc.page.height - 50;
      
      for (const activity of activities) {
        if (rowY + 50 > pageBottom) {
          doc.addPage();
          rowY = drawTableHeader(doc, 120); // <-- Adjusted start position
        }
        rowY = drawTableRow(doc, activity, rowY);
      }

      doc.end();
    }
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ message: 'Failed to generate export' });
  }
});

module.exports = router;