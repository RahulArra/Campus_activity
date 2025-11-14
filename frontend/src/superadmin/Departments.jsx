import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Building, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API } from '../stores/authStore';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '' });

    const loadDepartments = async () => {
        setIsLoading(true);
        try {
            const response = await API.get('/superadmin/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
            alert('Failed to load departments.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.code.trim()) {
            alert('Please fill in all fields.');
            return;
        }

        setIsSaving(true);
        try {
            await API.post('/superadmin/add-department', formData);
            await loadDepartments();
            setIsModalOpen(false);
            setFormData({ name: '', code: '' });
        } catch (error) {
            console.error("Failed to add department:", error);
            alert('Failed to add department.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;

        try {
            await API.delete(`/superadmin/department/${id}`);
            await loadDepartments();
        } catch (error) {
            console.error("Failed to delete department:", error);
            alert('Failed to delete department.');
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    return (
        <div className="departments-container">
            <style>
                {`
                .departments-container {
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

                .add-card {
                    background-color: #ffffff;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
                    margin-bottom: 24px;
                    border: 1px solid #e5e7eb;
                }

                .add-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                }

                .add-title svg {
                    margin-right: 8px;
                    color: #4f46e5;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .form-input {
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    width: 100%;
                    font-size: 14px;
                    transition: border-color 0.2s;
                    background-color: #ffffff;
                }

                .form-input:focus {
                    border-color: #4f46e5;
                    outline: none;
                    box-shadow: 0 0 0 1px #4f46e5;
                }

                .btn-add {
                    padding: 10px 24px;
                    background-color: #4f46e5;
                    color: white;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                }

                .btn-add:hover:not(:disabled) {
                    background-color: #4338ca;
                }

                .btn-add:disabled {
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

                .departments-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .departments-table th {
                    padding: 12px 24px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .departments-table td {
                    padding: 12px 24px;
                    font-size: 14px;
                    color: #1f2937;
                    border-bottom: 1px solid #f3f4f6;
                }

                .departments-table tr:hover {
                    background-color: #f5f5ff;
                }

                .btn-delete {
                    padding: 6px 10px;
                    border: 1px solid #ef4444;
                    border-radius: 6px;
                    color: #ef4444;
                    font-weight: 500;
                    font-size: 13px;
                    transition: background-color 0.2s;
                    background-color: #fef2f2;
                    cursor: pointer;
                }

                .btn-delete:hover {
                    background-color: #fee2e2;
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
                    <Building size={24} />
                    Department Management
                </h1>
                <p className="header-subtitle">Manage academic departments and their codes.</p>
            </header>

            <div className="add-card">
                <h2 className="add-title">
                    <PlusCircle size={20} />
                    Add New Department
                </h2>
                <form onSubmit={handleAddDepartment}>
                    <div className="form-grid">
                        <input
                            type="text"
                            placeholder="Department Name (e.g., Computer Science)"
                            value={formData.name}
                            onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                            className="form-input"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Department Code (e.g., CSE)"
                            value={formData.code}
                            onChange={(e) => setFormData(p => ({...p, code: e.target.value}))}
                            className="form-input"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-add" disabled={isSaving}>
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                        {isSaving ? 'Adding...' : 'Add Department'}
                    </button>
                </form>
            </div>

            <div className="table-card">
                <h2 className="table-header">Departments ({departments.length})</h2>
                {isLoading ? (
                    <div className="loading-state">
                        <Loader2 size={24} />
                        <span>Loading departments...</span>
                    </div>
                ) : departments.length === 0 ? (
                    <p className="loading-state" style={{ color: '#6b7280' }}>No departments found.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="departments-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((dept) => (
                                    <tr key={dept._id}>
                                        <td>{dept.name}</td>
                                        <td>{dept.code}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteDepartment(dept._id)}
                                                className="btn-delete"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
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
};

export default Departments;
