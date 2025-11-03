import React, { useState, useEffect } from 'react';
import { Filter, Download, User, Calendar, Table2, CheckCircle, XCircle, Clock, FileText, Loader2 } from 'lucide-react';
import axios from 'axios'; 
import SubmissionDetailModal from './SubmissionDetailModal'; // Adjust path if needed
// --- TEMPORARY FIX: HARDCODED JWT FOR TESTING (Must be removed later by Shiva) ---
// This token is needed to pass the security check on the backend.
const USER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhmZTFlYTgzMTc4OGZiMWY3NjQ2NDAzIiwicm9sZSI6ImFkbWluIn0sImlhdCI6MTc2MTQ4NDQ3MSwiZXhwIjoxNzYxNDk1MjcxfQ.GLeUaGxQ-bVg9YsfFUHGgaXAY1spZ6Aw--VAYKKx650"; 
if (USER_TOKEN) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${USER_TOKEN}`;
}
// --- END TEMPORARY FIX ---


// --- HELPER FUNCTION: Maps status to color/icon ---
const getStatusBadge = (status) => {
    switch (status) {
        case 'Approved':
            return <span className="status-badge status-approved"><CheckCircle size={14} className="mr-1" /> Approved</span>;
        case 'Verified by Faculty': 
            return <span className="status-badge status-verified"><FileText size={14} className="mr-1" /> Verified</span>;
        case 'Rejected':
            return <span className="status-badge status-rejected"><XCircle size={14} className="mr-1" /> Rejected</span>;
        case 'submitted': 
        case 'Pending':
        default:
            return <span className="status-badge status-pending"><Clock size={14} className="mr-1" /> Pending</span>;
    }
};

const AdminSubmissionsView = () => {
    // --- STATE MANAGEMENT ---
    const [submissions, setSubmissions] = useState([]);
    const [filters, setFilters] = useState({
        studentName: '', 
        templateId: '',
        dateRangeFrom: '',
        dateRangeTo: '',
        department: '',
        status: 'All'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [templateOptions, setTemplateOptions] = useState([]);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
    // --- API CALLS ---

    const loadSubmissions = async () => {
        setIsLoading(true);
        const apiFilters = { ...filters };
        if (apiFilters.status === 'All') { delete apiFilters.status; }
        Object.keys(apiFilters).forEach(key => {
            if (!apiFilters[key]) delete apiFilters[key];
        });

        try {
            const response = await axios.get('/api/submissions', { params: apiFilters });
            setSubmissions(response.data); 
            console.log(response.data);
        } catch (error) {
            console.error("Failed to fetch submissions:", error.response ? error.response.data : error.message);
            alert('Failed to load submissions. Authentication or server error.');
            setSubmissions([]); 
        } finally {
            setIsLoading(false);
        }
    };
    const handleStatusUpdate = () => {
        loadSubmissions(); // Simply reload the list
    };
    const fetchTemplateOptions = async () => {
        try {
            const response = await axios.get('/api/templates');
            setTemplateOptions(response.data.map(t => ({ id: t._id, name: t.templateName })));
        } catch (error) {
            console.error("Failed to fetch template options:", error);
        }
    };

    const handleExport = async (format) => {
        setIsExporting(true);
        const apiFilters = { ...filters }; 
        if (apiFilters.status === 'All') delete apiFilters.status;
        Object.keys(apiFilters).forEach(key => {
            if (!apiFilters[key]) delete apiFilters[key];
        });

        try {
            console.log(`Starting export for ${format} with filters:`, filters);
            const response = await axios.get(`http://localhost:5000/api/exports/${format.toLowerCase()}`, { params: filters, responseType: 'blob' });
            console.log(`Export ${format} response received:`, response);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `CAPS_Report_${format}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
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

    // --- EFFECT HOOKS ---
    useEffect(() => {
        fetchTemplateOptions();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            loadSubmissions();
        }, 300); 
        return () => clearTimeout(handler);
    }, [filters]);


    // --- RENDERING LOGIC ---

    const columns = [
        { header: 'ID', accessor: '_id', render: (id) => <span className="text-id">{id.slice(-6)}</span> },
        { header: 'Student', accessor: 'userId', render: (user) => user?.name || 'Unknown User' }, 
        { header: 'Dept.', accessor: 'userId', render: (user) => user?.department || 'N/A' }, 
        { header: 'Activity', accessor: 'templateId', render: (template) => template?.templateName?.replace(/_/g, ' ') || 'Unknown Template' },
        { header: 'Date', accessor: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
  { header: 'Actions', accessor: '_id', render: (id) => ( // Use accessor '_id'
        <div className="flex-space">
            <button
                onClick={() => { // Updated onClick
                    setSelectedSubmissionId(id); // Set the ID of the submission to view
                    setIsDetailModalOpen(true); // Open the modal
                }}
                className="btn-verify" // Use CSS class
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
                /* Base Styles */
                .admin-container {
                    padding: 32px 16px;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                    background: linear-gradient(145deg, #f8f8ff 0%, #e0e7ff 100%);
                    color: #1f2937;
                }

                /* Header */
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

                /* Filter Card */
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

                /* Input/Select Styles (Responsive Grid) */
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
                
                /* Button Styles */
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

                /* Table Styles */
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
                    white-space: nowrap;
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

                /* Status Badges */
                .status-badge {
                    padding: 4px 12px;
                    border-radius: 9999px; /* rounded-full */
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

                /* Loading State */
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
                    Admin Submissions & Reporting
                </h1>
                <p className="header-subtitle">View, filter, and export student activity records for official reporting.</p>
            </header>
            
            {/* Filter Card */}
            <div className="filter-card">
                <h2 className="filter-title">
                    <Filter size={20} />
                    Report Filters
                </h2>
                
                {/* Filter Grid */}
                <div className="filter-grid">
                    <input type="text" placeholder="Filter by Student Name/ID (Disabled)" disabled />
                    
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters(p => ({...p, department: e.target.value}))}
                    >
                        <option value="">All Departments</option>
                        {['CSE', 'ECE', 'IT', 'Mech', 'Civil', 'EEE'].map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(p => ({...p, status: e.target.value}))}
                    >
                        <option value="All">All Statuses</option>
                        <option value="submitted">Submitted / Pending</option>
                        <option value="Verified by Faculty">Verified by Faculty</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <select
                        value={filters.templateId}
                        onChange={(e) => setFilters(p => ({...p, templateId: e.target.value}))}
                    >
                        <option value="">All Activity Types</option>
                        {templateOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>
                
                {/* Date Range Filters */}
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

                {/* Buttons Section */}
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

            {/* Submission Table */}
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
            {/* Submission Detail Modal */}
 {isDetailModalOpen && (
     <SubmissionDetailModal
         submissionId={selectedSubmissionId}
         onClose={() => setIsDetailModalOpen(false)} // Function to close the modal
         onUpdate={handleStatusUpdate} // Function to refresh list after update
     />
 )}
        </div>
    );
};

export default AdminSubmissionsView;
