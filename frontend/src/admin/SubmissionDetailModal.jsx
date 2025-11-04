import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, X, Check, AlertTriangle, User, FileText, Calendar, Link as LinkIcon, Edit3, Clock } from 'lucide-react'; // <-- Added Clock here
import { API } from '../stores/authStore';

// Re-import the status badge helper (or move it to a shared utils file)
const getStatusBadge = (status) => {
    switch (status) {
        case 'Approved':
            return <span className="status-badge status-approved"><Check size={14} className="mr-1" /> Approved</span>;
        case 'Verified by Faculty':
            return <span className="status-badge status-verified"><FileText size={14} className="mr-1" /> Verified</span>;
        case 'Rejected':
            return <span className="status-badge status-rejected"><X size={14} className="mr-1" /> Rejected</span>;
        case 'submitted':
        case 'Pending':
        default:
            return <span className="status-badge status-pending"><Clock size={14} className="mr-1" /> Pending</span>;
    }
};

// Component to display each field and its submitted value
const DetailItem = ({ label, value }) => (
    <div className="detail-item">
        <strong className="detail-label">{label}:</strong>
        <span className="detail-value">{value || 'N/A'}</span>
    </div>
);

// Component to display proof files
const ProofLink = ({ proof }) => (
    <a href={proof.url} target="_blank" rel="noopener noreferrer" className="proof-link">
        <LinkIcon size={14} /> {proof.filename || 'View Proof'}
    </a>
);


const SubmissionDetailModal = ({ submissionId, onClose, onUpdate }) => {
    const [submission, setSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [rejectionReason, setRejectionReason] = useState(''); // State for rejection reason input

    // Fetch submission details when the modal opens or submissionId changes
    useEffect(() => {
        if (!submissionId) return;

        const fetchDetails = async () => {
            setIsLoading(true);
            setError('');
            try {
                console.log('Token:', localStorage.getItem('token'));
                // API call to get details for a single submission
                const response = await API.get(`/submissions/${submissionId}`);
                setSubmission(response.data);
            } catch (err) {
                console.error("Failed to fetch submission details:", err);
                setError('Failed to load submission details. Please try again.');
                setSubmission(null); // Clear previous data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [submissionId]); // Re-run effect if submissionId changes

    // Handle status update (Approve/Reject)
    const handleStatusChange = async (newStatus) => {
        // Basic validation for rejection reason
        if (newStatus === 'Rejected' && !rejectionReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        setIsUpdating(true);
        setError('');
        try {
            // API call to update the status
            await axios.put(`http://localhost:5000/api/submissions/${submissionId}/status`, {
                newStatus: newStatus,
                // Optionally include remarks if the backend supports it
                ...(newStatus === 'Rejected' && { remarks: rejectionReason })
            });
            onUpdate(); // Trigger refresh of the main submission list
            onClose(); // Close the modal
        } catch (err) {
            console.error(`Failed to ${newStatus === 'Approved' ? 'approve' : 'reject'} submission:`, err);
            setError(`Failed to update status. ${err.response?.data?.message || 'Server error'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Helper to render dynamic data fields
    const renderDataFields = () => {
        if (!submission || !submission.data || typeof submission.data !== 'object') {
            return <p className="text-muted">No specific data submitted.</p>;
        }
        // Get the field definitions from the populated templateId
        const templateFields = submission.templateId?.fields || [];

        // Create a map for quick lookup of field labels by fieldId
        const fieldLabelMap = templateFields.reduce((map, field) => {
            map[field.fieldId] = field.label;
            return map;
        }, {});

        return Object.entries(submission.data).map(([key, value]) => {
            const label = fieldLabelMap[key] || key.replace(/_/g, ' '); // Use mapped label or format key
            // Format arrays or objects nicely, otherwise display value
            const displayValue = Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : value);
            return <DetailItem key={key} label={label} value={displayValue} />;
        });
    };


    return (
        <div className="modal-overlay modal-detail">
             {/* Embedded CSS */}
            <style>{`
                /* General modal styles (can be shared) */
                .modal-overlay {
                    position: fixed; inset: 0; background-color: rgba(17, 24, 39, 0.7);
                    display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
                }
                .modal-content {
                    background-color: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    width: 100%; max-width: 768px; /* Slightly wider for details: max-w-3xl */
                    max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column;
                }
                .modal-header {
                    padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;
                    position: sticky; top: 0; background-color: white; z-index: 10;
                }
                 .modal-title { font-size: 18px; font-weight: 600; color: #111827; }
                 .modal-close-btn { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; }
                 .modal-close-btn:hover { color: #374151; }
                 .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; font-size: 14px; }
                 .modal-footer {
                    padding: 12px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; /* Space between buttons and reject input */
                    position: sticky; bottom: 0; background-color: #f9fafb; gap: 12px;
                }
                .text-muted { color: #6b7280; font-style: italic; font-size: 13px; }
                .loading-spinner { display: flex; justify-content: center; align-items: center; padding: 40px; }
                .error-message { color: #dc2626; background-color: #fee2e2; border: 1px solid #fecaca; padding: 10px; border-radius: 6px; font-size: 13px; display: flex; align-items: center; }
                 .error-message svg { margin-right: 8px; }

                /* Detail Modal Specific Styles */
                 .modal-detail .modal-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed #e5e7eb; }
                 .modal-detail .section-title { font-size: 16px; font-weight: 600; color: #4f46e5; margin-bottom: 12px; display: flex; align-items: center; }
                 .modal-detail .section-title svg { margin-right: 8px; }
                 .modal-detail .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; } /* Responsive grid */

                 .detail-item { display: flex; flex-direction: column; gap: 2px; }
                 .detail-label { font-weight: 500; color: #4b5563; font-size: 13px; }
                 .detail-value { color: #1f2937; word-break: break-word; } /* Allow long values to wrap */

                 .proofs-list { display: flex; flex-direction: column; gap: 8px; }
                 .proof-link {
                     color: #3b82f6; text-decoration: none; font-size: 13px; display: inline-flex; align-items: center;
                     background-color: #eff6ff; padding: 4px 8px; border-radius: 4px; transition: background-color 0.2s;
                 }
                 .proof-link:hover { background-color: #dbeafe; text-decoration: underline; }
                 .proof-link svg { margin-right: 6px; }

                 /* Status Badge Styling (should match AdminSubmissionsView) */
                 .status-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; white-space: nowrap; }
                 .status-approved { color: #059669; background-color: #d1fae5; }
                 .status-verified { color: #2563eb; background-color: #dbeafe; }
                 .status-rejected { color: #dc2626; background-color: #fee2e2; }
                 .status-pending { color: #d97706; background-color: #fef3c7; }
                 .status-badge svg { margin-right: 4px; }

                 /* Rejection input */
                 .rejection-input { flex-grow: 1; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }

                 /* Action buttons in footer */
                 .action-buttons { display: flex; gap: 12px; }
                 .btn-approve { background-color: #10b981; color: white; }
                 .btn-approve:hover:not(:disabled) { background-color: #059669; }
                 .btn-reject { background-color: #ef4444; color: white; }
                 .btn-reject:hover:not(:disabled) { background-color: #dc2626; }
                 .btn:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>

            <div className="modal-content">
                <header className="modal-header">
                    <h2 className="modal-title">Submission Details & Verification</h2>
                    <button type="button" onClick={onClose} className="modal-close-btn" title="Close">
                        <X size={20} />
                    </button>
                </header>

                <div className="modal-body">
                    {isLoading && (
                        <div className="loading-spinner">
                            <Loader2 size={24} className="animate-spin text-indigo-500" />
                            <span className="ml-2 text-indigo-500">Loading details...</span>
                        </div>
                    )}
                    {error && (
                        <div className="error-message">
                            <AlertTriangle size={18} /> {error}
                        </div>
                    )}
                    {submission && !isLoading && !error && (
                        <>
                            {/* Section 1: Basic Info */}
                            <div className="modal-section">
                                <h3 className="section-title"><User size={18} /> Submission Info</h3>
                                <div className="detail-grid">
                                    <DetailItem label="Submission ID" value={submission._id?.slice(-8) || 'N/A'} />
                                    <DetailItem label="Student Name" value={submission.userId?.name || 'Unknown'} />
                                    <DetailItem label="Department" value={submission.userId?.department || 'N/A'} />
                                    <DetailItem label="Activity Type" value={submission.templateId?.templateName?.replace(/_/g, ' ') || 'N/A'} />
                                    <DetailItem label="Submitted On" value={new Date(submission.createdAt).toLocaleString()} />
                                </div>
                            </div>

                            {/* Section 2: Submitted Data */}
                            <div className="modal-section">
                                <h3 className="section-title"><FileText size={18} /> Activity Details</h3>
                                <div className="detail-grid">
                                    {renderDataFields()}
                                </div>
                            </div>

                            {/* Section 3: Proofs */}
                            <div className="modal-section">
                                <h3 className="section-title"><LinkIcon size={18} /> Proofs Submitted ({submission.proofs?.length || 0})</h3>
                                {submission.proofs && submission.proofs.length > 0 ? (
                                    <div className="proofs-list">
                                        {submission.proofs.map((proof, idx) => (
                                            <ProofLink key={idx} proof={proof} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">No proofs were submitted.</p>
                                )}
                            </div>



                        </>
                    )}
                </div>

   
            </div>
        </div>
    );
};

export default SubmissionDetailModal;