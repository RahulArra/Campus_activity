import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API } from '../stores/authStore';

const BulkUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
            setSelectedFile(file);
            setResults(null);
        } else {
            alert('Please select a CSV or Excel file.');
            e.target.value = '';
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await API.post('/superadmin/bulk-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(response.data);
        } catch (error) {
            console.error("Upload failed:", error);
            alert('Upload failed. Please check the file format and try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bulk-upload-container">
            <style>
                {`
                .bulk-upload-container {
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

                .upload-card {
                    background-color: #ffffff;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
                    margin-bottom: 24px;
                    border: 1px solid #e5e7eb;
                }

                .upload-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                }

                .upload-title svg {
                    margin-right: 8px;
                    color: #4f46e5;
                }

                .file-input-wrapper {
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    padding: 32px;
                    text-align: center;
                    transition: border-color 0.2s;
                    background-color: #f9fafb;
                }

                .file-input-wrapper:hover {
                    border-color: #4f46e5;
                }

                .file-input {
                    display: none;
                }

                .file-input-label {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4f46e5;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                .file-input-label:hover {
                    background-color: #4338ca;
                }

                .selected-file {
                    margin-top: 16px;
                    padding: 12px;
                    background-color: #eef2ff;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .selected-file svg {
                    margin-right: 8px;
                    color: #4f46e5;
                }

                .btn-upload {
                    margin-top: 16px;
                    padding: 12px 32px;
                    background-color: #10b981;
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

                .btn-upload:hover:not(:disabled) {
                    background-color: #059669;
                }

                .btn-upload:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .results-card {
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    margin-bottom: 32px;
                }

                .results-header {
                    font-size: 18px;
                    font-weight: 600;
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .results-section {
                    padding: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .results-section:last-child {
                    border-bottom: none;
                }

                .results-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                }

                .results-title.success svg {
                    color: #10b981;
                }

                .results-title.error svg {
                    color: #ef4444;
                }

                .results-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .results-table th {
                    padding: 8px 12px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .results-table td {
                    padding: 8px 12px;
                    font-size: 14px;
                    color: #1f2937;
                    border-bottom: 1px solid #f3f4f6;
                }

                .results-table tr:hover {
                    background-color: #f5f5ff;
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
                    <Upload size={24} />
                    Bulk Upload
                </h1>
                <p className="header-subtitle">Upload CSV files to bulk import students or teachers.</p>
            </header>

            <div className="upload-card">
                <h2 className="upload-title">
                    <FileText size={20} />
                    File Upload
                </h2>

                <div className="file-input-wrapper">
                    <input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileSelect}
                        className="file-input"
                        id="file-input"
                    />
                    <label htmlFor="file-input" className="file-input-label">
                        Choose CSV/Excel File
                    </label>
                    <p style={{ marginTop: '12px', color: '#6b7280' }}>
                        Supported formats: CSV, Excel (.xlsx)
                    </p>
                </div>

                {selectedFile && (
                    <div className="selected-file">
                        <FileText size={20} />
                        <span>{selectedFile.name}</span>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    className="btn-upload"
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>

            {results && (
                <div className="results-card">
                    <h2 className="results-header">Upload Results</h2>
                    console.log(results.suc)
                    {results.successData && results.successData.length > 0 && (
                        <div className="results-section">
                            <h3 className="results-title success">
                                <CheckCircle size={18} />
                                Successfully Imported ({results.successData.length})
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Department</th>
                                            <th>Roll No</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.successData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.email}</td>
                                                <td>{item.department}</td>
                                                <td>{item.rollNo || item.teacherId || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {results.errors && results.errors.length > 0 && (
                        <div className="results-section">
                            <h3 className="results-title error">
                                <XCircle size={18} />
                                Import Errors ({results.errors.length})
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Row</th>
                                            <th>Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.errors.map((error, index) => (
                                            <tr key={index}>
                                                <td>{error.row}</td>
                                                <td>{error.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;
