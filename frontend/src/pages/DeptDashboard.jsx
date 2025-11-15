import React, { useEffect, useState } from "react";
import {
  getUploadSummary,
  getStudents,
  getTeachers,
  getOverview,
  exportDeptCSV,
  exportDeptPDF,
} from "../services/deptAdminApi";

import {
  Users,
  GraduationCap,
  Book,
  Loader2,
  LayoutDashboard,
} from "lucide-react";

export default function DeptDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const dept = user?.department || "Unknown";

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [yearFilter, setYearFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    async function loadDeptData() {
      setLoading(true);
      try {
        const sum = await getUploadSummary(dept);
        setSummary(sum);

        const s = await getStudents(dept);
        const t = await getTeachers(dept);
        const o = await getOverview(dept);

        setStudents(s.students || []);
        setTeachers(t.teachers || []);
        setOverview(o || {});
      } catch (err) {
        console.error("DeptAdmin Load Error:", err);
      }
      setLoading(false);
    }

    loadDeptData();
  }, [dept]);

  // Prevent crash if still loading overview
  if (loading || !overview) {
    return (
      <div
        style={{ padding: 40 }}
        className="loading-state flex items-center justify-center text-center"
      >
        <Loader2 size={32} className="animate-spin" />
        <span style={{ marginLeft: 12, fontSize: 18, fontWeight: 600 }}>
          Loading Department Data...
        </span>
      </div>
    );
  }

  const filteredStudents = students.filter((s) => {
    if (yearFilter && s.year !== Number(yearFilter)) return false;
    if (sectionFilter && s.section !== sectionFilter) return false;

    if (classFilter) {
      const className = `${dept}-${s.year}${s.section}`;
      if (className !== classFilter) return false;
    }
    return true;
  });

  return (
    <div className="admin-container">
      <style>
        {`
        .admin-container {
          padding: 32px 16px;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(145deg, #f8f8ff 0%, #e0e7ff 100%);
          color: #1f2937;
        }
        .card {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }
        `}
      </style>

      {/* HEADER */}
      <div className="header-card">
        <h1 className="header-title">
          <LayoutDashboard size={28} />
          {dept} Department — Dashboard
        </h1>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="card" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>
            <Users size={20} style={{ marginRight: 8 }} />
            Students
          </h3>
          <div style={{ fontSize: 32, fontWeight: 800 }}>
            {overview?.studentsCount ?? 0}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>
            <GraduationCap size={20} style={{ marginRight: 8 }} />
            Teachers
          </h3>
          <div style={{ fontSize: 32, fontWeight: 800 }}>
            {overview?.teachersCount ?? 0}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>
            <Book size={20} style={{ marginRight: 8 }} />
            Classes
          </h3>
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            {(overview?.classes || []).join(", ") || "None"}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="card">
          <h2>Latest Upload Summary</h2>
          <p><b>Uploaded:</b> {summary.uploadedCount}</p>
          <p><b>Errors:</b> {summary.errorCount}</p>
          <p><b>Uploaded At:</b> {new Date(summary.uploadedAt).toLocaleString()}</p>
        </div>
      )}

      {/* STUDENTS TABLE */}
      <div className="card">
        <h2>Students ({filteredStudents.length})</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Year</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.rollNo}</td>
                  <td>{s.year}</td>
                  <td>{s.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TEACHERS TABLE */}
      <div className="card">
        <h2>Teachers ({teachers.length})</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Teacher ID</th>
                <th>Class Assigned</th>
                <th>Is Class Teacher?</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.teacherId}</td>
                  <td>{t.classAssigned || "—"}</td>
                  <td>{t.isClassTeacher ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
