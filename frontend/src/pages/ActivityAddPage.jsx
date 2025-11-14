import React, { useEffect, useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Your Reusable Components
import CustomCard from '../components/ui/CustomCard'; 
import CustomButton from '../components/ui/CustomButton'; 
import SystemAlert from '../components/ui/SystemAlert'; // Your reusable alert component

// Rahul's Components (Update imports to your structure)
import DynamicFormRenderer from '../components/DynamicFormRenderer'; 
import FileUploader from '../components/FileUploader'; 

// Your API Service (Assumed path)
import { API } from '../stores/authStore'; 
// NOTE: Ensure your API service is named 'API' as defined in your authStore, 
// OR rename the import above from 'API' to 'api' to match the original code.

function ActivityAddPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [proofFiles, setProofFiles] = useState([]); 
  
  // State for UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Use your configured Axios instance (API from authStore)
    API.get('/templates') // Calls GET /api/templates
      .then(res => {
        // Handle various backend response formats (res.data or res.data.templates)
        const rawTemplates = Array.isArray(res.data) ? res.data : res.data.templates;
        
        if (rawTemplates && Array.isArray(rawTemplates)) {
          // Map to standardized structure and set state
          const mappedTemplates = rawTemplates.map(template => ({
            ...template,
            // Ensure fields have a consistent 'id' for the DynamicFormRenderer
            fieldId: template.fieldId || template.id 
          }));
          setTemplates(mappedTemplates);
        } else {
          setTemplates([]);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load activity templates. Please check the backend connection.");
        setShowError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Handle template selection and reset form state
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find(t => t._id === templateId);
    
    setSelectedTemplate(template || null);
    setProofFiles([]); 
    setError('');
    setSuccess('');
    setShowError(false);
    setShowSuccess(false);

    if (template) {
      // Create a fresh, empty state object for the new form (critical for Dynamic Forms)
      const initialData = {};
      template.fields.forEach(field => {
        if (field.fieldId) { 
          initialData[field.fieldId] = ''; // Map template field IDs → form data object [cite: 47]
        }
      });
      setFormData(initialData);
    } else {
      setFormData({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTemplate) {
        setError("Please select an activity template.");
        setShowError(true);
        return;
    }
    // Note: Rahul's DynamicFormRenderer handles per-field validation.
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    setShowError(false);
    setShowSuccess(false);

    const payload = {
      templateId: selectedTemplate._id,
      data: formData, // Contains the dynamic field data
      proofs: proofFiles // Contains the array of proof URL objects
    };
    
    // Call Naveen's Submission API
    try {
      await API.post('/submissions', payload); // Calls POST /api/submissions
      
      setSuccess("Activity submitted successfully! You can view it on your Dashboard.");
      setShowSuccess(true);
      
      // Reset the form completely
      setFormData({});
      setProofFiles([]);
      setSelectedTemplate(null);

    } catch (err) {
      console.error("Submission Error:", err);
      const errorMessage = err.response?.data?.message || "Submission failed. Please check field data and uploaded proofs.";
      setError(errorMessage);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AddCircleOutlineIcon sx={{ mr: 1, color: 'secondary.main' }} />
        Submit New Activity
      </Typography>

      <SystemAlert 
        severity="success" 
        message={success} 
        open={showSuccess} 
        setOpen={setShowSuccess} 
      />
      <SystemAlert 
        severity="error" 
        message={error} 
        open={showError} 
        setOpen={setShowError} 
      />

      <CustomCard title="1. Select Activity Template">
        <FormControl fullWidth disabled={isLoading} sx={{ mt: 1, mb: 2 }}>
            <InputLabel id="template-select-label">Activity Template</InputLabel>
            <Select 
                labelId="template-select-label"
                value={selectedTemplate ? selectedTemplate._id : ''}
                onChange={handleTemplateChange}
                label="Activity Template"
            >
                <MenuItem value="">
                    {isLoading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : 'Select Template Type'}
                </MenuItem>
                {templates.map(t => (
                    <MenuItem key={t._id} value={t._id}>
                        {t.name || t.templateName || `Template ID: ${t._id}`}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
      </CustomCard>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {selectedTemplate && (
          <>
            {/* 3. Dynamic Form Renderer (Rahul's Component) */}
            <CustomCard title={`2. ${selectedTemplate.name || 'Activity'} Details`}>
                <DynamicFormRenderer
                    template={selectedTemplate}
                    formData={formData} 
                    onFormChange={setFormData} // Two-way binding for form data
                />
            </CustomCard>
            
            <Divider sx={{ my: 3 }} />

            {/* 4. File Uploader (Rahul/Shravan Component) */}
            <CustomCard title="3. Upload Proofs">
              <FileUploader
                proofs={proofFiles}
                setProofs={setProofFiles} // Two-way binding for proof files
              />
            </CustomCard>

            {/* Final Submission Button */}
            <Box sx={{ mt: 4, textAlign: 'right' }}>
              <CustomButton 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={isLoading || !proofFiles.length} // Disable if loading or no proofs uploaded
              >
                {isLoading ? "Submitting..." : "Submit Activity"}
              </CustomButton>
            </Box>
          </>
        )}
      </Box>
      
      {!isLoading && templates.length === 0 && !error && (
        <Alert severity="warning" sx={{ mt: 3 }}>No activity templates are currently available. Contact admin.</Alert>
      )}
    </Box>
  );
}

export default ActivityAddPage;