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

        // Send year and section to backend for filtering
        Object.keys(apiFilters).forEach(key => {
            if (!apiFilters[key]) delete apiFilters[key];
        });

        try {
            const endpoint = `${process.env.REACT_APP_API_URL}/reports/department/${apiFilters.department}`;

            delete apiFilters.department;

            const response = await API.get(endpoint, { params: apiFilters });
            let data = response.data.data || response.data;

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
        { header: 'Student', accessor: 'userId', render: (user) => user?.name || 'Unknown User' },
        { header: 'Roll No', accessor: 'userId', render: (user) => user?.rollNo || 'N/A' },
        { header: 'Dept.', accessor: 'userId', render: (user) => user?.department || 'N/A' },
        { header: 'Year', accessor: 'userId', render: (user) => user?.year || 'N/A' },
        { header: 'Activity', accessor: 'templateId', render: (templateId) => {
    if (typeof templateId === 'object' && templateId !== null) {
        return templateId.templateName?.replace(/_/g, ' ') || 'Unknown Activity';
    }
    if (typeof templateId === 'string') {
        const foundTemplate = templateOptions.find(t => t._id === templateId);
        return foundTemplate?.templateName?.replace(/_/g, ' ') || 'Unknown Activity';
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
        <div className="dept-reports-container">
            <div className="dept-reports-content">
            <style>
                {`
                .dept-reports-container {
                    padding: 24px;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #1f2937;
                }

                .dept-reports-content {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .header-section {
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                    padding: 32px;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    margin-bottom: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                }

                .header-title {
                    font-size: 32px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    color: #1e293b;
                    margin-bottom: 8px;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .header-title svg {
                    margin-right: 16px;
                    color: #6366f1;
                    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
                }

                .header-subtitle {
                    color: #64748b;
                    font-size: 16px;
                    font-weight: 500;
                    margin: 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 24px;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.9);
                    padding: 20px;
                    border-radius: 16px;
                    text-align: center;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .stat-number {
                    font-size: 28px;
                    font-weight: 800;
                    color: #6366f1;
                    margin-bottom: 4px;
                }

                .stat-label {
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .filters-section {
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                    padding: 32px;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    margin-bottom: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                }

                .filters-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                }

                .filters-title svg {
                    margin-right: 12px;
                    color: #6366f1;
                }

                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                }

                .filter-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                }

                .filter-label svg {
                    margin-right: 6px;
                    color: #6366f1;
                }

                .filters-section input,
                .filters-section select {
                    padding: 14px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    background: #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .filters-section input:focus,
                .filters-section select:focus {
                    border-color: #6366f1;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    transform: translateY(-1px);
                }

                .date-input-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .date-input-group input {
                    flex: 1;
                }

                .actions-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                    margin-top: 24px;
                }

                .btn-primary {
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .export-buttons {
                    display: flex;
                    gap: 12px;
                }

                .btn-secondary {
                    padding: 14px 20px;
                    background: #ffffff;
                    color: #374151;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .btn-secondary:hover:not(:disabled) {
                    border-color: #6366f1;
                    color: #6366f1;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
                }

                .table-section {
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                }

                .table-header-section {
                    padding: 24px 32px;
                    border-bottom: 1px solid #e2e8f0;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                }

                .table-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .table-title svg {
                    color: #6366f1;
                }

                .table-wrapper {
                    overflow-x: auto;
                    max-height: 600px;
                    overflow-y: auto;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .data-table thead {
                    position: sticky;
                    top: 0;
                    background: #f8fafc;
                    z-index: 10;
                }

                .data-table th {
                    padding: 16px 24px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #e2e8f0;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                }

                .data-table td {
                    padding: 16px 24px;
                    font-size: 14px;
                    color: #1e293b;
                    border-bottom: 1px solid #f1f5f9;
                    transition: background-color 0.2s ease;
                }

                .data-table tbody tr {
                    transition: all 0.2s ease;
                }

                .data-table tbody tr:hover {
                    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
                    transform: scale(1.01);
                }

                .data-table tbody tr:nth-child(even) {
                    background: rgba(248, 250, 252, 0.5);
                }

                .data-table tbody tr:nth-child(even):hover {
                    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
                }

                .btn-action {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
                }

                .btn-action:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
                }

                .text-muted {
                    color: #64748b;
                    font-size: 12px;
                    font-family: 'Monaco', 'Menlo', monospace;
                }

                .loading-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 40px;
                    color: #6366f1;
                    text-align: center;
                }

                .loading-icon {
                    animation: pulse 2s infinite;
                    margin-bottom: 16px;
                }

                .loading-text {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .loading-subtext {
                    color: #64748b;
                    font-size: 14px;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 40px;
                    color: #64748b;
                    text-align: center;
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .empty-text {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .empty-subtext {
                    font-size: 14px;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @media (max-width: 768px) {
                    .dept-reports-container {
                        padding: 16px;
                    }

                    .header-section,
                    .filters-section,
                    .table-section {
                        padding: 20px;
                        margin-bottom: 20px;
                    }

                    .header-title {
                        font-size: 24px;
                    }

                    .filters-grid {
                        grid-template-columns: 1fr;
                    }

                    .actions-section {
                        flex-direction: column;
                        gap: 16px;
                        align-items: stretch;
                    }

                    .export-buttons {
                        justify-content: center;
                    }

                    .data-table th,
                    .data-table td {
                        padding: 12px 16px;
                        font-size: 12px;
                    }
                }
                `}
            </style>

            <section className="header-section">
                <h1 className="header-title">
                    <Table2 size={24} />
                    {dept} Department Reports & Submissions
                </h1>
                <p className="header-subtitle">View, filter, and export student activity records for {dept} department.</p>
            </section>

            <section className="filters-section">
                <h2 className="filters-title">
                    <Filter size={20} />
                    Report Filters
                </h2>

                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="filter-label">
                            <User size={16} />
                            Student Name/ID
                        </label>
                        <input
                            type="text"
                            placeholder="Filter by Student Name/ID"
                            value={filters.studentName}
                            onChange={(e) => setFilters(p => ({...p, studentName: e.target.value}))}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <Calendar size={16} />
                            Year
                        </label>
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
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <FileText size={16} />
                            Section
                        </label>
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
                </div>

                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="filter-label">
                            <Calendar size={16} />
                            Date Range
                        </label>
                        <div className="date-input-group">
                            <input
                                type="date"
                                placeholder="From"
                                value={filters.dateRangeFrom}
                                onChange={(e) => setFilters(p => ({...p, dateRangeFrom: e.target.value}))}
                            />
                            <input
                                type="date"
                                placeholder="To"
                                value={filters.dateRangeTo}
                                onChange={(e) => setFilters(p => ({...p, dateRangeTo: e.target.value}))}
                            />
                        </div>
                    </div>
                </div>

                <div className="actions-section">
                    <button onClick={loadSubmissions} className="btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Filter size={18} />}
                        {isLoading ? 'Searching...' : 'Search Submissions'}
                    </button>

                    <div className="export-buttons">
                        <button onClick={() => handleExport('CSV')} className="btn-secondary" disabled={isExporting}>
                            <Download size={16} /> Export CSV
                        </button>
                        <button onClick={() => handleExport('PDF')} className="btn-secondary" disabled={isExporting}>
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                </div>
            </section>

            <section className="table-section">
                <div className="table-header-section">
                    <h2 className="table-title">
                        <Table2 size={20} />
                        Submission Results ({submissions.length})
                    </h2>
                </div>
                {isLoading ? (
                    <div className="loading-section">
                        <Loader2 size={48} className="loading-icon" />
                        <div className="loading-text">Fetching data from server...</div>
                        <div className="loading-subtext">Please wait while we load your submissions</div>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} className="empty-icon" />
                        <div className="empty-text">No submissions found</div>
                        <div className="empty-subtext">Try adjusting your filters to see more results</div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
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
            </section>
            {isDetailModalOpen && (
     <SubmissionDetailModal
         submissionId={selectedSubmissionId}
         onClose={() => setIsDetailModalOpen(false)}
         onUpdate={handleStatusUpdate}
     />
 )}
            </div>
        </div>
    );
};

export default DeptReports;
