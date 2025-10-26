

import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Use our new api service
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import FileUploader from '../components/FileUploader'; // Import Shravan's component
import './ActivityAddPage.css'; // <-- 1. IMPORT THE CSS
function ActivityAddPage() {
  // State for data
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({}); // This is the single source of truth
  const [proofFiles, setProofFiles] = useState([]); // Kept your state name
  
  // State for UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setIsLoading(true);
    api.get('/templates')
      .then(res => {
        // Support both array and object response
        const rawTemplates = Array.isArray(res.data) ? res.data : res.data.templates;
        if (rawTemplates && Array.isArray(rawTemplates)) {
          const mappedTemplates = rawTemplates.map(template => ({
            ...template,
            fields: (template.fields || []).map(field => ({
              ...field,
              id: field.fieldId || field.id
            }))
          }));
          setTemplates(mappedTemplates);
        } else {
          setTemplates([]);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load templates.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // When the template changes, we must reset the form data
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find(t => t._id === templateId);
    
    setSelectedTemplate(template || null);
    setProofFiles([]); // Clear old proofs
    setError('');
    setSuccess('');

    if (template) {
      // Create a fresh, empty state object for the new form
      const initialData = {};
      template.fields.forEach(field => {
        if (field) { // Add a check for safety
          initialData[field.fieldId] = '';
        }
      });
      setFormData(initialData);
    } else {
      setFormData({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      templateId: selectedTemplate._id,
      data: formData, // Use 'data' as the key
      proofs: proofFiles // Send the array of proof objects
    };

    try {
      await api.post('/submissions', payload); // Use api service
      setSuccess("✅ Activity Submitted Successfully!");
      // Reset the form completely
      setFormData({});
      setProofFiles([]);
      setSelectedTemplate(null);
    } catch (err) {
      console.error(err);
      setError("❌ Submission Failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="submit-activity-container">
      <h2>Submit Activity</h2>

      {/* Show loading message only while fetching templates */}
      {isLoading && !templates.length && <p>Loading templates...</p>}

      <select 
        onChange={handleTemplateChange} 
        // Set value to reset the dropdown on success
        value={selectedTemplate ? selectedTemplate._id : ''}
        disabled={isLoading}
      >
        <option value="">Select Activity Template</option>
        {templates.map(t => (
          <option key={t._id} value={t._id}>{t.name || t.templateName || 'Untitled Template'}</option>
        ))}
      </select>

      <hr />

      {selectedTemplate && (
        <form onSubmit={handleSubmit}>
          <h3>{selectedTemplate.name}</h3>
          <DynamicFormRenderer
            template={selectedTemplate}
            formData={formData} // Pass the state down
            onFormChange={setFormData} // Pass the state setter down
          />

          <hr />
          <h4>Upload Proofs</h4>
          <FileUploader
            proofs={proofFiles}
            setProofs={setProofFiles} // Use your state names
          />

          <button type="submit" disabled={isLoading} style={{marginTop: '20px'}}>
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}

      {/* Show final success or error messages */}
      {!isLoading && success && <p style={{ color: 'green' }}>{success}</p>}
      {!isLoading && error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default ActivityAddPage;