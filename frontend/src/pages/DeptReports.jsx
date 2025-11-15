import React, { useEffect, useState, useCallback } from "react";
import { Filter, Loader2, Table2 } from "lucide-react";
import { API } from "../stores/authStore";

export default function DeptReports() {
  const user = JSON.parse(localStorage.getItem("user"));
  const dept = user?.department;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    year: "",
    section: "",
    from: "",
    to: "",
    status: "",
  });

  const loadSubmissions = useCallback(async () => {
    setLoading(true);

    try {
      const query = {};

      if (filters.year) query.year = filters.year;
      if (filters.section) query.section = filters.section;
      if (filters.from) query.from = filters.from;
      if (filters.to) query.to = filters.to;
      if (filters.status) query.status = filters.status;

      const res = await API.get(`/reports/department/${dept}`, {
        params: query,
      });

      setSubmissions(res.data.data || []);
    } catch (err) {
      console.error(err);
      setSubmissions([]);
    }

    setLoading(false);
  }, [dept, filters]);

  useEffect(() => {
    const t = setTimeout(() => loadSubmissions(), 300);
    return () => clearTimeout(t);
  }, [filters, loadSubmissions]);

  return (
    <div className="admin-container">
      <style>
        {`
        .admin-container {
          padding: 32px 16px;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(145deg, #f8f8ff 0%, #e0e7ff 100%);
        }
        .card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #f9fafb;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        tr:hover { background: #f5f5ff; }
        `}
      </style>

      {/* Header */}
      <div className="card">
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Table2 size={24} style={{ marginRight: 10 }} />
          {dept} — Department Reports
        </h1>
      </div>

      {/* Filters */}
      <div className="card">
        <h2
          style={{
            marginBottom: 16,
            fontSize: 18,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Filter size={20} style={{ marginRight: 8 }} /> Filters
        </h2>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* YEAR FILTER */}
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              minWidth: 150,
            }}
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          {/* SECTION FILTER */}
          <select
            value={filters.section}
            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              minWidth: 150,
            }}
          >
            <option value="">All Sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          {/* STATUS FILTER */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              minWidth: 150,
            }}
          >
            <option value="">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified by Faculty">Verified</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* FROM DATE */}
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
            }}
          />

          {/* TO DATE */}
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
            }}
          />
        </div>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="card" style={{ textAlign: "right", marginBottom: 20 }}>
        <button
          onClick={async () => {
            try {
              const res = await API.get(`/reports/department/${dept}/export`, {
                responseType: "blob",
              });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement("a");
              link.href = url;
              link.download = `${dept}_Report.csv`;
              link.click();
            } catch (err) {
              alert("CSV export failed");
            }
          }}
          style={{
            padding: "10px 20px",
            background: "#4f46e5",
            color: "white",
            borderRadius: 8,
            border: "none",
            marginRight: 10,
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>

        <button
          onClick={async () => {
            try {
              const res = await API.get(
                `/reports/department/${dept}/export?format=pdf`,
                { responseType: "blob" }
              );
              const url = window.URL.createObjectURL(
                new Blob([res.data], { type: "application/pdf" })
              );
              const link = document.createElement("a");
              link.href = url;
              link.download = `${dept}_Report.pdf`;
              link.click();
            } catch (err) {
              alert("PDF export failed");
            }
          }}
          style={{
            padding: "10px 20px",
            background: "#059669",
            color: "white",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Export PDF
        </button>
      </div>

      {/* TABLE */}
      <div className="card">
        <h2 style={{ marginBottom: 12, fontWeight: 700 }}>
          Submission Results ({submissions.length})
        </h2>

        {loading ? (
          <div style={{ padding: 20, display: "flex", alignItems: "center" }}>
            <Loader2 className="animate-spin" size={20} />
            <span style={{ marginLeft: 10 }}>Loading...</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s._id}>
                    <td>{s._id.slice(-6)}</td>
                    <td>{s.userId?.name || "Unknown"}</td>
                    <td>{s.templateId?.templateName || "Activity"}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>

                    {/* Status Badge */}
                    <td>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "white",
                          background:
                            s.status === "Approved"
                              ? "#10b981"
                              : s.status === "Verified by Faculty"
                              ? "#3b82f6"
                              : s.status === "Rejected"
                              ? "#ef4444"
                              : "#6b7280",
                        }}
                      >
                        {s.status || "Submitted"}
                      </span>
                    </td>
                                      </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

