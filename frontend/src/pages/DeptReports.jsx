import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Download, User, Calendar, Table2, CheckCircle, XCircle, Clock, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';
import SubmissionDetailModal from '../admin/SubmissionDetailModal'; // Adjust path if needed
import { API } from '../stores/authStore';



const DeptReports = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const dept = user?.department || "Unknown";

    const [submissions, setSubmissions] = useState([]);
    const [templateOptions, setTemplateOptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [filters, setFilters] = useState({
        studentName: '',
        year: '',
        section: '',
        dateRangeFrom: '',
        dateRangeTo: '',
        department: dept
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

    const fetchTemplateOptions = useCallback(async () => {
        try {
            const response = await API.get(`${process.env.REACT_APP_API_URL}/templates`);
            setTemplateOptions(response.data);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await API.get(`${process.env.REACT_APP_API_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }, []);

    useEffect(() => {
        fetchTemplateOptions();
        fetchUsers();
    }, [fetchTemplateOptions, fetchUsers]);

    const loadSubmissions = useCallback(async () => {
        setIsLoading(true);
        const apiFilters = { ...filters };

        if (apiFilters.dateRangeFrom) {
            apiFilters.from = apiFilters.dateRangeFrom;
            delete apiFilters.dateRangeFrom;
        }
        if (apiFilters.dateRangeTo) {
            apiFilters.to = apiFilters.dateRangeTo;
            delete apiFilters.dateRangeTo;
        }

        // Remove year and section for backend filtering, handle on frontend
        delete apiFilters.year;
        delete apiFilters.section;

        Object.keys(apiFilters).forEach(key => {
            if (!apiFilters[key]) delete apiFilters[key];
        });

        try {
            const endpoint = `${process.env.REACT_APP_API_URL}/reports/department/${apiFilters.department}`;

            delete apiFilters.department;

            const response = await API.get(endpoint, { params: apiFilters });
            let data = response.data.data || response.data;

            // Frontend filtering for year and section using users data
            if (filters.year) {
                data = data.filter(sub => {
                    const user = users.find(u => u._id === sub.userId);
                    return user?.year == filters.year;
                });
            }
            if (filters.section) {
                data = data.filter(sub => {
                    const user = users.find(u => u._id === sub.userId);
                    return user?.section == filters.section;
                });
            }

            setSubmissions(data);
            console.log('Loaded submissions:', data);
        } catch (error) {
            console.error("Failed to fetch submissions:", error.response ? error.response.data : error.message);
            alert('Failed to load submissions. Authentication or server error.');
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const handleStatusUpdate = () => {
        loadSubmissions();
    };

    const handleExport = async (format) => {
        setIsExporting(true);
        const apiFilters = { ...filters };

        if (apiFilters.dateRangeFrom) {
            apiFilters.from = apiFilters.dateRangeFrom;
            delete apiFilters.dateRangeFrom;
        }
        if (apiFilters.dateRangeTo) {
            apiFilters.to = apiFilters.dateRangeTo;
            delete apiFilters.dateRangeTo;
        }

        Object.keys(apiFilters).forEach(key => {
            if (!apiFilters[key]) delete apiFilters[key];
        });

        try {
            console.log(`Starting export for ${format} with filters:`, apiFilters);
            const endpoint = `${process.env.REACT_APP_API_URL}/reports/department/${filters.department}/export`;

            const response = await API.get(endpoint, {
                params: {
                    ...apiFilters,
                    format: format.toLowerCase(),
                    from: apiFilters.from,
                    to: apiFilters.to
                },
                responseType: 'blob'
            });
            console.log(`Export ${format} response received:`, response);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `CAPS_Report_${filters.department}_${format}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            console.log(`Export ${format} completed successfully.`);

        } catch (error) {
            console.error(`Failed to export ${format} report.`, error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            alert(`Failed to generate ${format} report. Check console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            loadSubmissions();
        }, 300);
        return () => clearTimeout(handler);
    }, [filters, loadSubmissions]);

    const columns = [
        { header: 'ID', accessor: '_id', render: (id) => <span className="text-id">{id.slice(-6)}</span> },
        { header: 'Student', accessor: 'userId', render: (user) => user ? `${user.name} (${user.rollNo})` : 'Unknown User' },
        { header: 'Dept.', accessor: 'userId', render: (user) => user?.department || 'N/A' },
        { header: 'Year', accessor: 'userId', render: (user) => user?.year || 'N/A' },
{ header: 'Activity', accessor: 'templateId', render: (templateId) => {
    if (typeof templateId === 'string') {
        const foundTemplate = templateOptions.find(t => t._id === templateId);
        return foundTemplate?.name?.replace(/_/g, ' ') || 'Unknown Activity';
    }
    return 'Unknown Activity';
}},
        { header: 'Date', accessor: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
  { header: 'Actions', accessor: '_id', render: (id) => (
        <div className="flex-space">
            <button
                onClick={() => {
                    setSelectedSubmissionId(id);
                    setIsDetailModalOpen(true);
                }}
                className="btn-verify"
            >
                View
            </button>
        </div>
    )},
    ];

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

                .header-card {
                    background-color: #ffffff;
                    padding: 16px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    margin-bottom: 24px;
                    border: 1px solid #e5e7eb;
                }
                .header-title {
                    font-size: 24px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    color: #1f2937;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #f3f4f6;
                }
                .header-title svg {
                    margin-right: 12px;
                    color: #4f46e5;
                }
                .header-subtitle {
                    color: #6b7280;
                    margin-top: 4px;
                    font-size: 14px;
                }

                .filter-card {
                    background-color: #ffffff;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
                    margin-bottom: 24px;
                    border: 1px solid #e5e7eb;
                }
                .filter-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                }
                .filter-title svg {
                    margin-right: 8px;
                    color: #4f46e5;
                }

                .filter-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .filter-card input, .filter-card select {
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    width: 100%;
                    font-size: 14px;
                    transition: border-color 0.2s;
                    background-color: #ffffff;
                }
                .filter-card input:focus, .filter-card select:focus {
                    border-color: #4f46e5;
                    outline: none;
                    box-shadow: 0 0 0 1px #4f46e5;
                }
                .date-label {
                    display: flex;
                    align-items: center;
                    color: #4b5563;
                    font-size: 14px;
                }
                .date-label input {
                    margin-left: 8px;
                    padding: 8px;
                }

                .btn-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    margin-top: 16px;
                    justify-content: space-between;
                }

                .btn-search {
                    padding: 10px 24px;
                    background-color: #4f46e5;
                    color: white;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 180px;
                }
                .btn-search:hover:not(:disabled) {
                    background-color: #4338ca;
                }
                .btn-search:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .export-group {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .btn-export {
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    transition: background-color 0.2s;
                    border: 1px solid #d1d5db;
                    background-color: #f9fafb;
                    color: #374151;
                }
                .btn-export svg {
                    margin-right: 8px;
                }
                .btn-export:hover:not(:disabled) {
                    background-color: #e5e7eb;
                }

                .table-card {
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    margin-bottom: 32px;
                }
                .table-header {
                    font-size: 18px;
                    font-weight: 600;
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .table-wrapper {
                    overflow-x: auto;
                }
                .submission-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .submission-table th {
                    padding: 12px 24px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }
                .submission-table td {
                    padding: 12px 24px;
                    font-size: 14px;
                    color: #1f2937;
                    border-bottom: 1px solid #f3f4f6;
                }
                .submission-table tr:hover {
                    background-color: #f5f5ff;
                }

                .btn-verify {
                    padding: 6px 10px;
                    border: 1px solid #a5b4fc;
                    border-radius: 6px;
                    color: #4f46e5;
                    font-weight: 500;
                    font-size: 13px;
                    transition: background-color 0.2s;
                    background-color: #eef2ff;
                }
                .btn-verify:hover {
                    background-color: #c7d2fe;
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    width: fit-content;
                }
                .status-badge svg {
                    margin-right: 4px;
                }
                .status-approved { background-color: #d1fae5; color: #065f46; }
                .status-verified { background-color: #bfdbfe; color: #1d4ed8; }
                .status-rejected { background-color: #fee2e2; color: #991b1b; }
                .status-pending { background-color: #fef9c3; color: #a16207; }
                .text-id {
                    color: #6b7280;
                    font-size: 12px;
                    font-family: monospace;
                }

                .loading-state {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 40px;
                    color: #4f46e5;
                    font-weight: 500;
                }
                .loading-state svg {
                    animation: spin 1s linear infinite;
                    margin-right: 12px;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                `}
            </style>

            <header className="header-card">
                <h1 className="header-title">
                    <Table2 size={24} />
                    {dept} Department Reports & Submissions
                </h1>
                <p className="header-subtitle">View, filter, and export student activity records for {dept} department.</p>
            </header>

            <div className="filter-card">
                <h2 className="filter-title">
                    <Filter size={20} />
                    Report Filters
                </h2>

                <div className="filter-grid">
                    <input
                        type="text"
                        placeholder="Filter by Student Name/ID"
                        value={filters.studentName}
                        onChange={(e) => setFilters(p => ({...p, studentName: e.target.value}))}
                    />

                    <select
                        value={filters.year}
                        onChange={(e) => setFilters(p => ({...p, year: e.target.value}))}
                    >
                        <option value="">All Years</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>

                    <select
                        value={filters.section}
                        onChange={(e) => setFilters(p => ({...p, section: e.target.value}))}
                    >
                        <option value="">All Sections</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>

                <div className="filter-grid">
                     <label className="date-label">
                        <Calendar size={18} />
                        From:
                        <input type="date" value={filters.dateRangeFrom} onChange={(e) => setFilters(p => ({...p, dateRangeFrom: e.target.value}))} />
                    </label>
                    <label className="date-label">
                        <Calendar size={18} />
                        To:
                        <input type="date" value={filters.dateRangeTo} onChange={(e) => setFilters(p => ({...p, dateRangeTo: e.target.value}))} />
                    </label>
                </div>

                <div className="btn-group">
                    <button onClick={loadSubmissions} className="btn-search" disabled={isLoading}>
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Filter size={18} />}
                        {isLoading ? 'Searching...' : 'Search Submissions'}
                    </button>

                    <div className="export-group">
                        <button onClick={() => handleExport('CSV')} className="btn-export" disabled={isExporting}>
                            <Download size={16} /> Export CSV
                        </button>
                        <button onClick={() => handleExport('PDF')} className="btn-export" disabled={isExporting}>
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-card">
                <h2 className="table-header">Submission Results ({submissions.length})</h2>
                {isLoading ? (
                    <div className="loading-state">
                        <Loader2 size={24} />
                        <span>Fetching data from server...</span>
                    </div>
                ) : submissions.length === 0 ? (
                    <p className="loading-state" style={{ color: '#6b7280' }}>No submissions found matching the criteria.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="submission-table">
                            <thead>
                                <tr>
                                    {columns.map(col => (
                                        <th key={col.header}>{col.header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((row) => (
                                    <tr key={row._id}>
                                        {columns.map(col => (
                                            <td key={`${row._id}-${col.header}`}>
                                                {col.render ? col.render(col.accessor === '_id' ? row._id : row[col.accessor], row) : row[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isDetailModalOpen && (
     <SubmissionDetailModal
         submissionId={selectedSubmissionId}
         onClose={() => setIsDetailModalOpen(false)}
         onUpdate={handleStatusUpdate}
     />
 )}
        </div>
    );
};

export default DeptReports;
