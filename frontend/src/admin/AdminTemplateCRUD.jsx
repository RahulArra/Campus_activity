import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, X, Save, FileText, List, Loader2 } from 'lucide-react';
// IMPORTANT: Shiva needs to install axios: npm install axios
import axios from 'axios';

// NOTE: Removed hardcoded development JWT. The app now relies on the real
// authentication flow (token stored in localStorage and attached by the
// API/interceptor in `authStore` or `services/api`). Keep tokens out of source.


// --- Sub-component for editing fields within the modal ---
const FieldEditor = ({ field, index, updateField, removeField }) => {
    // Defines the allowed input types for dynamic fields
    const FIELD_TYPES = ['text', 'number', 'date', 'select', 'file', 'textarea'];

    return (
        // Each field editor has its own container with styling
        <div className="field-editor-item">
            <h4 className="field-editor-title">Field #{index + 1}</h4>

            {/* Grid layout for Label, Type, and Required checkbox */}
            <div className="field-editor-grid">
                {/* Input for the field's label */}
                <input
                    type="text"
                    value={field.label || ''}
                    // When the label changes, update the form data state
                    onChange={(e) => updateField(index, 'label', e.target.value)}
                    placeholder="Field Label (e.g., Company Name)"
                    className="form-input grid-col-span-2" // Spans 2 columns in the grid
                    required // HTML5 validation: this field must be filled
                />
                {/* Dropdown to select the field type */}
                <select
                    value={field.type || 'text'}
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                    className="form-select" // Takes 1 column
                    required
                >
                    {/* Populate options from FIELD_TYPES array */}
                    {FIELD_TYPES.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                </select>
                {/* Checkbox to mark the field as required */}
                <div className="field-required-checkbox"> {/* Takes 1 column */}
                    <label>
                        <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                        />
                        Required
                    </label>
                </div>
            </div>

            {/* Input for options (only shown if type is 'select') */}
            {(field.type === 'select') && (
                <div className="field-options-input">
                    <input
                        type="text"
                        // Join array into comma-separated string for display
                        value={field.options ? field.options.join(', ') : ''}
                        // Split comma-separated string back into array on change
                        onChange={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        placeholder="Select Options (e.g., Option A, Option B)"
                        className="form-input"
                    />
                </div>
            )}

             {/* Input for placeholder text */}
             <div className="field-options-input">
                 <input
                     type="text"
                     value={field.placeholder || ''}
                     onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                     placeholder="Placeholder Text (Optional)"
                     className="form-input"
                 />
             </div>


            {/* Button to remove this specific field */}
            <div className="field-remove-button">
                <button type="button" onClick={() => removeField(index)}>
                    <Trash2 size={14} /> Remove Field
                </button>
            </div>
        </div>
    );
};


// --- Main Admin Template CRUD Component ---
const AdminTemplateCRUD = () => {
    // --- STATE MANAGEMENT ---
    const [templates, setTemplates] = useState([]); // Holds the list of templates fetched from API
    const [isLoading, setIsLoading] = useState(false); // Tracks loading state for table
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls visibility of Add/Edit modal
    const [isSaving, setIsSaving] = useState(false); // Tracks saving state for modal button
    const [isEditing, setIsEditing] = useState(false); // Determines if modal is for Add or Edit
    const [currentTemplateId, setCurrentTemplateId] = useState(null); // Stores MongoDB _id when editing
    const [formData, setFormData] = useState({ // Holds data for the template being added/edited
        templateName: '',
        templateCategory: 'Technical', // Default category
        fields: [], // Array to hold field objects
    });

    // --- API FUNCTIONS (Using Axios) ---

    // Function to fetch all templates from the backend
    const loadTemplates = async () => {
        setIsLoading(true); // Show loading indicator in table
        try {
            // ACTUAL API CALL to your backend endpoint
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/templates`);
            // Update the state with fetched data
            setTemplates(response.data);
        } catch (error) {
            // Log error and show alert if API call fails
            console.error("Failed to fetch templates:", error.response?.data?.message || error.message);
            alert('Failed to load templates. Please ensure the backend server is running and accessible.');
            setTemplates([]); // Clear table on error
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    // Function to save a new template or update an existing one
    const handleSaveTemplate = async (e) => {
        e.preventDefault(); // Prevent default form submission
        // Basic frontend validation
        if (!formData.templateName.trim()) return alert("Template Name cannot be empty.");
        if (formData.fields.length === 0) return alert("Template must have at least one field.");

        setIsSaving(true); // Show saving indicator on button
        try {
            if (isEditing) {
                // If editing, send PUT request with template ID
                await axios.put(`/api/templates/${currentTemplateId}`, formData);
            } else {
                // If adding, send POST request
                await axios.post('/api/templates', formData);
            }
            await loadTemplates(); // Refresh the template list in the table
            setIsModalOpen(false); // Close the modal on success
        } catch (error) {
            // Handle errors, including specific duplicate key error from MongoDB
            const errorMsg = error.response?.data?.message || "An unknown error occurred.";
             if (error.response?.data?.error?.includes('E11000')) { // Check for MongoDB duplicate error code
                 alert(`Failed to save template: A template with the name "${formData.templateName}" already exists.`);
            } else {
                 alert(`Failed to save template: ${errorMsg}`); // Generic error
            }
            console.error("Save template error:", error.response || error);
        } finally {
            setIsSaving(false); // Hide saving indicator
        }
    };

    // Function to delete a template by its ID
    const handleDeleteTemplate = async (id) => { // Expects MongoDB _id
        // Confirm before deleting
        if (!window.confirm("Are you sure you want to permanently delete this template? This affects all related submissions.")) return;

        setIsLoading(true); // Show loading indicator (can reuse table loading state)
        try {
            // ACTUAL API CALL to delete the template
            await axios.delete(`/api/templates/${id}`);
            await loadTemplates(); // Refresh the list immediately
        } catch (error) {
            console.error("Failed to delete template:", error.response?.data?.message || error.message);
            alert('Failed to delete template. Check console.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- MODAL & FORM HANDLERS ---

    // Opens the modal in "Add" mode
    const handleAddTemplateClick = () => {
        setIsEditing(false); // Not editing
        setCurrentTemplateId(null); // No ID needed for adding
        // Reset form data to defaults
        setFormData({ templateName: '', templateCategory: 'Technical', fields: [] });
        setIsModalOpen(true); // Show the modal
    };

    // Opens the modal in "Edit" mode, pre-filling form data
    const handleEditTemplateClick = (template) => {
        setIsEditing(true); // Editing mode
        setCurrentTemplateId(template._id); // Store the MongoDB _id
        // Set form data based on the selected template
        setFormData({
            templateName: template.templateName,
            templateCategory: template.templateCategory,
            // Use deep copy (JSON stringify/parse) for fields array to prevent state mutation issues
            fields: JSON.parse(JSON.stringify(template.fields || [])),
        });
        setIsModalOpen(true); // Show the modal
    };

    // Adds a new, blank field object to the formData.fields array
    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                // Default new field structure
                { fieldId: `new_field_${Date.now()}`, label: '', type: 'text', required: false, options: [], placeholder: '' }
            ]
        }));
    };

    // Updates a specific property (key) of a field object at a given index in the fields array
    const updateField = (index, key, value) => {
        // Create a new array copy to avoid direct state mutation
        const newFields = [...formData.fields];
        // Create a copy of the specific field object being updated
        const currentField = { ...newFields[index] };
        // Update the specific property (e.g., 'label', 'type', 'required')
        currentField[key] = value;

        // Auto-generate a fieldId based on the label (simple sanitization)
        // This runs only if the label changes and it's not a newly added field
        if (key === 'label' && !currentField.fieldId.startsWith('new_field_')) {
             currentField.fieldId = value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_|_$/g, '');
        }

        newFields[index] = currentField; // Place the updated field copy back into the array copy
        // Update the component state with the new fields array
        setFormData(prev => ({ ...prev, fields: newFields }));
    };

    // Removes a field object from the formData.fields array by its index
    const removeField = (index) => {
        setFormData(prev => ({
            ...prev,
            // Filter out the field at the specified index
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    // --- EFFECT HOOK ---
    // Runs once when the component mounts to fetch initial template list
    useEffect(() => {
        loadTemplates();
    }, []); // Empty dependency array means run only once on mount

    // --- JSX RENDERING ---
    return (
        // Main container for the admin page
        <div className="admin-crud-container">
            {/* Embedded CSS Styles using <style> tag */}
            <style>{`
                /* General page styling */
                .admin-crud-container {
                    padding: 32px 16px; /* Vertical and horizontal padding */
                    min-height: 100vh; /* Full viewport height */
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; /* Standard system fonts */
                    background-color: #f9fafb; /* Light gray background */
                    color: #1f2937; /* Dark gray text */
                }
                /* Header styling */
                .crud-header {
                    display: flex;
                    justify-content: space-between; /* Space out title and button */
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb; /* Light gray border */
                }
                .crud-title {
                    font-size: 24px; /* Slightly smaller title */
                    font-weight: 700;
                    color: #111827; /* Very dark gray */
                    display: flex;
                    align-items: center;
                }
                 .crud-title svg { margin-right: 10px; color: #4f46e5; } /* Icon styling */
                .crud-subtitle { margin-bottom: 24px; color: #6b7280; font-size: 14px; }

                /* General button styling */
                .btn {
                    padding: 8px 14px; /* Slightly smaller padding */
                    border-radius: 6px; /* Slightly smaller radius */
                    font-weight: 500;
                    font-size: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s, box-shadow 0.2s;
                    border: none;
                    white-space: nowrap; /* Prevent wrapping */
                }
                .btn-primary { background-color: #4f46e5; color: white; } /* Indigo */
                .btn-primary:hover { background-color: #4338ca; } /* Darker Indigo */
                .btn-primary svg { margin-right: 6px; }

                /* Table card container */
                .table-card {
                    background-color: #ffffff;
                    border-radius: 8px; /* Standard radius */
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0,0,0,0.06);
                    overflow: hidden; /* Needed for border-radius on table */
                    border: 1px solid #e5e7eb;
                }
                /* Table styling */
                .crud-table { width: 100%; border-collapse: collapse; }
                .crud-table th {
                    padding: 10px 16px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280; /* Medium gray */
                    text-transform: uppercase;
                    background-color: #f9fafb; /* Light gray header */
                    border-bottom: 1px solid #e5e7eb;
                }
                .crud-table td {
                    padding: 10px 16px;
                    font-size: 14px;
                    color: #1f2937;
                    border-bottom: 1px solid #f3f4f6; /* Very light gray lines */
                    white-space: nowrap;
                    vertical-align: middle; /* Align text vertically */
                }
                 .crud-table tr:hover { background-color: #f0f1ff; } /* Light indigo hover */
                 .crud-table .actions { text-align: right; }
                 .crud-table .actions button { /* Edit/Delete buttons */
                     background: none; border: none; padding: 4px 6px; cursor: pointer;
                     font-size: 13px; display: inline-flex; align-items: center;
                     border-radius: 4px; transition: background-color 0.1s;
                 }
                 .crud-table .actions button:hover { background-color: rgba(0,0,0,0.05); }
                 .crud-table .actions .btn-edit { color: #4f46e5; }
                 .crud-table .actions .btn-delete { color: #ef4444; margin-left: 6px; }
                 .crud-table .actions svg { margin-right: 4px; }

                 /* Loading/No Data text styles */
                 .loading-text, .no-data-text { text-align: center; padding: 24px; color: #6b7280; font-style: italic; font-size: 14px; }

                /* Modal overlay styles */
                .modal-overlay {
                    position: fixed; inset: 0; background-color: rgba(17, 24, 39, 0.7); /* Dark overlay */
                    display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
                }
                /* Modal content container */
                .modal-content {
                    background-color: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    width: 100%; max-width: 672px; /* Fixed max width */
                    max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column;
                }
                /* Modal header */
                .modal-header {
                    padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;
                    position: sticky; top: 0; background-color: white; z-index: 10;
                }
                 .modal-title { font-size: 18px; font-weight: 600; color: #111827; }
                 .modal-close-btn { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; }
                 .modal-close-btn:hover { color: #374151; }

                /* Modal body/form area */
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; } /* Consistent spacing */
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } /* 2-column grid for basic info */
                .form-group label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px; }
                /* Standard form input/select styles */
                .form-input, .form-select {
                    width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
                    font-size: 14px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); /* Subtle inset shadow */
                }
                 .form-input:focus, .form-select:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2); } /* Focus ring */
                 .form-select { background-color: white; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 1em 1em; padding-right: 2.5rem; }

                /* Section for dynamic fields */
                .fields-section { padding-top: 16px; border-top: 1px solid #e5e7eb; }
                .fields-title { font-size: 16px; font-weight: 600; color: #111827; display: flex; align-items: center; margin-bottom: 16px; }
                 .fields-title svg { margin-right: 8px; color: #4f46e5; }
                 .fields-container { display: flex; flex-direction: column; gap: 12px; } /* Space between field editors */

                 /* "Add New Field" button style */
                 .btn-add-field {
                     width: 100%; padding: 8px; border: 1px dashed #a5b4fc; /* Dashed indigo border */
                     color: #4f46e5; font-size: 14px;
                     border-radius: 6px; display: flex; align-items: center; justify-content: center;
                     cursor: pointer; transition: background-color 0.2s; margin-top: 16px;
                 }
                 .btn-add-field:hover { background-color: #eef2ff; } /* Light indigo background on hover */
                 .btn-add-field svg { margin-right: 6px; }

                /* Modal footer styling */
                .modal-footer {
                    padding: 12px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end;
                    position: sticky; bottom: 0; background-color: #f9fafb; /* Light gray footer background */
                }
                 .btn-save { background-color: #10b981; color: white; font-size: 14px; } /* Green save button */
                 .btn-save:hover:not(:disabled) { background-color: #059669; }
                 .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
                 .btn-save svg { margin-right: 6px; }
                 .animate-spin { animation: spin 1s linear infinite; }
                 @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }


                /* Field Editor specific styles */
                .field-editor-item {
                    border: 1px solid #c7d2fe; padding: 12px; /* Smaller padding */
                    border-radius: 6px; background-color: #eef2ff; /* Light indigo background */
                }
                 .field-editor-title { font-weight: 600; font-size: 13px; margin-bottom: 8px; color: #4338ca; }
                 .field-editor-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; } /* Grid for inputs */
                 .grid-col-span-2 { grid-column: span 2 / span 2; }
                 .field-required-checkbox { /* Container for checkbox */
                     display: flex; align-items: center; justify-content: center;
                     background-color: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 0 8px;
                 }
                 .field-required-checkbox label { font-size: 12px; color: #4b5563; display: flex; align-items: center; cursor: pointer; }
                 .field-required-checkbox input { margin-right: 5px; height: 14px; width: 14px; accent-color: #4f46e5; }

                 .field-options-input { margin-top: 10px; } /* Space above options/placeholder */
                 .field-remove-button { text-align: right; margin-top: 10px; } /* Align remove button */
                 .field-remove-button button { /* Styling for remove button */
                     font-size: 12px; color: #be123c; background: none; border: none;
                     cursor: pointer; display: inline-flex; align-items: center; padding: 4px;
                 }
                 .field-remove-button button:hover { color: #881337; }
                 .field-remove-button svg { margin-right: 4px; }
            `}</style>

            {/* Header section with Title and Add Button */}
            <header className="crud-header">
                <h1 className="crud-title">
                    <List size={24} /> Activity Template Manager
                </h1>
                <button onClick={handleAddTemplateClick} className="btn btn-primary">
                    <PlusCircle size={18} /> New Template
                </button>
            </header>

            <p className="crud-subtitle">
                Manage the dynamic form schemas. Use this to add, edit, or delete activity types available for submission.
            </p>

            {/* Table displaying the list of templates */}
            <div className="table-card">
                <div style={{ overflowX: 'auto' }}> {/* Makes table horizontally scrollable on small screens */}
                    <table className="crud-table">
                        <thead>
                            <tr>
                                <th>Template Name</th>
                                <th>Category</th>
                                <th>Fields</th>
                                <th className="actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Conditional rendering based on loading state and data */}
                            {isLoading ? (
                                <tr><td colSpan="4" className="loading-text"><Loader2 size={18} className="animate-spin inline mr-2"/>Loading templates...</td></tr>
                            ) : templates.length === 0 ? (
                                <tr><td colSpan="4" className="no-data-text">No templates found. Click 'New Template' to add one.</td></tr>
                            ) : (
                                // Map through templates and render table rows
                                templates.map((template) => (
                                    <tr key={template._id}>
                                        <td>{template.templateName.replace(/_/g, ' ')}</td> {/* Replace underscores for display */}
                                        <td>{template.templateCategory}</td>
                                        <td>{template.fields?.length || 0}</td> {/* Show field count */}
                                        <td className="actions">
                                            {/* Edit Button */}
                                            <button type="button" onClick={() => handleEditTemplateClick(template)} className="btn-edit" title="Edit Template">
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            {/* Delete Button */}
                                            <button type="button" onClick={() => handleDeleteTemplate(template._id)} className="btn-delete" title="Delete Template">
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing Templates */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* Modal Header */}
                        <header className="modal-header">
                            <h2 className="modal-title">{isEditing ? 'Edit Template' : 'Create New Template'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="modal-close-btn" title="Close">
                                <X size={20} />
                            </button>
                        </header>

                        {/* Form inside the modal */}
                        <form onSubmit={handleSaveTemplate} className="modal-body">
                            {/* Basic Template Info (Name, Category) */}
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="templateName">Template Name *</label>
                                    <input
                                        id="templateName" type="text" value={formData.templateName}
                                        onChange={(e) => setFormData({...formData, templateName: e.target.value})}
                                        placeholder="Unique Name (e.g., National_Hackathon)" className="form-input" required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="templateCategory">Category *</label>
                                    <select
                                        id="templateCategory" value={formData.templateCategory}
                                        onChange={(e) => setFormData({...formData, templateCategory: e.target.value})}
                                        className="form-select" required
                                    >
                                        {/* Dynamic category options */}
                                        {['Technical', 'Cultural', 'Sports', 'Research', 'Professional', 'Community', 'General'].map(cat => (
                                          <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Section for managing dynamic fields */}
                            <div className="fields-section">
                                <h3 className="fields-title">
                                    <FileText size={18} /> Dynamic Form Fields ({formData.fields.length}) *
                                </h3>
                                <div className="fields-container">
                                    {/* Map through fields and render FieldEditor for each */}
                                    {formData.fields.map((field, index) => (
                                        <FieldEditor
                                            key={field.fieldId || `new-${index}`} // Use unique key
                                            field={field} index={index}
                                            updateField={updateField} removeField={removeField}
                                        />
                                    ))}
                                </div>
                                {/* Button to add a new field */}
                                <button type="button" onClick={handleAddField} className="btn-add-field">
                                    <PlusCircle size={18} /> Add New Field
                                </button>
                            </div>

                             {/* Modal Footer with Save Button */}
                             <div className="modal-footer">
                                <button type="submit" disabled={isSaving} className="btn btn-save">
                                    {/* Show loader when saving */}
                                    {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                    {isSaving ? 'Saving...' : (isEditing ? 'Update Template' : 'Save Template')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTemplateCRUD;