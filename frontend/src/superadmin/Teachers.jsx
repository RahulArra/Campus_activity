import React, { useState, useEffect, useCallback } from 'react';
import { Filter, UserCheck, Loader2, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { API } from '../stores/authStore';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [filters, setFilters] = useState({
        department: '',
        search: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadTeachers = useCallback(async () => {
        setIsLoading(true);
        const apiFilters = { ...filters };
        Object.keys(apiFilters).forEach(key => {
            if (!apiFilters[key]) delete apiFilters[key];
        });

        try {
            const response = await API.get('/superadmin/teachers', {
                params: { ...apiFilters, page: currentPage, limit: 10 }
            });
            setTeachers(response.data.teachers || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
            alert('Failed to load teachers.');
            setTeachers([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters, currentPage]);

    const handleResetPassword = async (id) => {
        if (!window.confirm('Are you sure you want to reset this teacher\'s password?')) return;

        try {
            await API.post(`/superadmin/reset-password/${id}`);
            alert('Password reset successfully.');
        } catch (error) {
            console.error("Failed to reset password:", error);
            alert('Failed to reset password.');
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            loadTeachers();
        }, 300);
        return () => clearTimeout(handler);
    }, [filters, loadTeachers]);

    return (
        <div className="teachers-container">
            <style>
                {`
                .teachers-container {
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
                    border: none;
                    cursor: pointer;
                }

                .btn-search:hover:not(:disabled) {
                    background-color: #4338ca;
                }

                .btn-search:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
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

                .teachers-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .teachers-table th {
                    padding: 12px 24px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .teachers-table td {
                    padding: 12px 24px;
                    font-size: 14px;
                    color: #1f2937;
                    border-bottom: 1px solid #f3f4f6;
                }

                .teachers-table tr:hover {
                    background-color: #f5f5ff;
                }

                .btn-reset {
                    padding: 6px 10px;
                    border: 1px solid #f59e0b;
                    border-radius: 6px;
                    color: #f59e0b;
                    font-weight: 500;
                    font-size: 13px;
                    transition: background-color 0.2s;
                    background-color: #fef3c7;
                    cursor: pointer;
                }

                .btn-reset:hover {
                    background-color: #fde68a;
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .pagination-btn {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background-color: #ffffff;
                    color: #374151;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .pagination-btn:hover:not(:disabled) {
                    background-color: #f3f4f6;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .pagination-btn.active {
                    background-color: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
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
                    <UserCheck size={24} />
                    Teacher Management
                </h1>
                <p className="header-subtitle">View and manage teacher accounts.</p>
            </header>

            <div className="filter-card">
                <h2 className="filter-title">
                    <Filter size={20} />
                    Filters
                </h2>

                <div className="filter-grid">
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters(p => ({...p, department: e.target.value}))}
                    >
                        <option value="">All Departments</option>
                        {['CSE', 'ECE', 'IT', 'Mech', 'Civil', 'EEE'].map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Search by name or teacher ID"
                        value={filters.search}
                        onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
                    />
                </div>

                <button onClick={loadTeachers} className="btn-search" disabled={isLoading}>
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Filter size={18} />}
                    {isLoading ? 'Searching...' : 'Search Teachers'}
                </button>
            </div>

            <div className="table-card">
                <h2 className="table-header">Teachers ({teachers.length})</h2>
                {isLoading ? (
                    <div className="loading-state">
                        <Loader2 size={24} />
                        <span>Loading teachers...</span>
                    </div>
                ) : teachers.length === 0 ? (
                    <p className="loading-state" style={{ color: '#6b7280' }}>No teachers found.</p>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table className="teachers-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Teacher ID</th>
                                        <th>Department</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map((teacher) => (
                                        <tr key={teacher._id}>
                                            <td>{teacher.name}</td>
                                            <td>{teacher.teacherId}</td>
                                            <td>{teacher.department}</td>
                                            <td>{teacher.email}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleResetPassword(teacher._id)}
                                                    className="btn-reset"
                                                >
                                                    <RotateCcw size={14} />
                                                    Reset Password
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Teachers;
