// backend/routes/deptAdminRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UploadSummary = require("../models/UploadSummary");

// GET Upload Summary for Department Admin
router.get("/:dept/summary", async (req, res) => {
  try {
    const { dept } = req.params;

    const latest = await UploadSummary.findOne({ department: dept })
      .sort({ uploadedAt: -1 });

    res.json({ summary: latest || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to load summary" });
  }
});

// adjust path if your model is located elsewhere
const User = require('../models/user.model');


// GET /api/dept/:dept/students
router.get('/:dept/students', async (req, res) => {
  try {
    const dept = req.params.dept;
    const { year, section, q, page = 1, limit = 200 } = req.query;

    const filter = { department: dept, role: 'student' };
    if (year) filter.year = Number(year);
    if (section) filter.section = section;
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { rollNo: new RegExp(q, 'i') }
    ];

    const students = await User.find(filter)
      .select('name rollNo year section email phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('GET /api/dept/:dept/students err', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/dept/:dept/teachers
router.get('/:dept/teachers', async (req, res) => {
  try {
    const dept = req.params.dept;
    const { classAssigned, isClassTeacher, q, page = 1, limit = 200 } = req.query;

    const filter = { department: dept, role: 'teacher' };
    if (classAssigned) filter.classAssigned = classAssigned;
    if (typeof isClassTeacher !== 'undefined') {
      filter.isClassTeacher = (isClassTeacher === 'true' || isClassTeacher === true);
    }
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { teacherId: new RegExp(q, 'i') }
    ];

    const teachers = await User.find(filter)
      .select('name teacherId classAssigned isClassTeacher email phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ success: true, count: teachers.length, teachers });
  } catch (err) {
    console.error('GET /api/dept/:dept/teachers err', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/dept/:dept/overview
router.get('/:dept/overview', async (req, res) => {
  try {
    const dept = req.params.dept;
    // students count by year & list of classes
    const students = await User.find({ department: dept, role: 'student' }).select('year section rollNo').lean();
    const teachers = await User.find({ department: dept, role: 'teacher' }).select('teacherId classAssigned name').lean();

    const years = {};
    const classesSet = new Set();
    students.forEach(s => {
      const y = s.year || 'unknown';
      years[y] = (years[y] || 0) + 1;
      if (s.section) classesSet.add(`${dept}-${s.year || '0'}${s.section}`);
    });

    teachers.forEach(t => {
      if (t.classAssigned) classesSet.add(t.classAssigned);
    });

    res.json({
      success: true,
      dept,
      studentsCount: students.length,
      teachersCount: teachers.length,
      classes: Array.from(classesSet),
      years
    });
  } catch (err) {
    console.error('GET /api/dept/:dept/overview err', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/dept/:dept/export
router.get('/:dept/export', async (req, res) => {
  try {
    const dept = req.params.dept;

    const students = await User.find({ department: dept, role: 'student' }).lean();
    const teachers = await User.find({ department: dept, role: 'teacher' }).lean();

    const rows = [];

    students.forEach(s => {
      rows.push({
        Type: "Student",
        Name: s.name,
        ID: s.rollNo,
        Year: s.year,
        Section: s.section,
        ClassAssigned: "",
      });
    });

    teachers.forEach(t => {
      rows.push({
        Type: "Teacher",
        Name: t.name,
        ID: t.teacherId,
        Year: "",
        Section: "",
        ClassAssigned: t.classAssigned || "",
      });
    });

    // Convert to CSV
    const csv = [
      Object.keys(rows[0]).join(","),             // header
      ...rows.map(r => Object.values(r).join(",")) // body
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${dept}_department_report.csv`);
    res.send(csv);

  } catch (err) {
    console.error("Export Error:", err);
    res.status(500).json({ error: "Failed to export department report" });
  }
});

// GET /api/dept/:dept/export/pdf
router.get('/:dept/export/pdf', async (req, res) => {
  try {
    const dept = req.params.dept;

    const students = await User.find({ department: dept, role: 'student' }).lean();
    const teachers = await User.find({ department: dept, role: 'teacher' }).lean();

    const { jsPDF } = require("jspdf");
    require("jspdf-autotable");

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`${dept} Department Report`, 14, 20);

    // ---- STUDENTS TABLE ----
    doc.setFontSize(14);
    doc.text("Students", 14, 30);

    const studentRows = students.map(s => [
      s.name,
      s.rollNo,
      s.year,
      s.section
    ]);

    doc.autoTable({
      startY: 35,
      head: [["Name", "Roll No", "Year", "Section"]],
      body: studentRows,
    });

    // ---- TEACHERS TABLE ----
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text("Teachers", 14, finalY);

    const teacherRows = teachers.map(t => [
      t.name,
      t.teacherId,
      t.classAssigned || "—",
      t.isClassTeacher ? "Yes" : "No"
    ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [["Name", "Teacher ID", "Class Assigned", "Class Teacher?"]],
      body: teacherRows,
    });

    // Send PDF
    const pdfData = doc.output();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${dept}_report.pdf`);
    res.send(Buffer.from(pdfData, "binary"));

  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ error: "Failed to export PDF" });
  }
});


module.exports = router;
