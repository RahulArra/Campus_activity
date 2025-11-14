import React, { useEffect, useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress, Divider, Button } from '@mui/material'; // Added Button
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Added Icon

// Your Reusable Components
import CustomCard from '../components/ui/CustomCard'; 
import CustomButton from '../components/ui/CustomButton'; 
import SystemAlert from '../components/ui/SystemAlert'; 

// Rahul's Components (Update imports to your structure if necessary)
import DynamicFormRenderer from '../components/DynamicFormRenderer'; 
import FileUploader from '../components/FileUploader'; 

// Your API Service (Assumed path)
import { API } from '../stores/authStore'; 
// NOTE: Renaming the imported API service to 'api' to match the function body
const api = API;


function ActivityAddPage() {
    const navigate = useNavigate(); // Initialize navigate hook

    // State for data
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
        api.get('/templates') // Calls GET /api/templates
            .then(res => {
                const rawTemplates = Array.isArray(res.data) ? res.data : res.data.templates;
                
                if (rawTemplates && Array.isArray(rawTemplates)) {
                    const mappedTemplates = rawTemplates.map(template => ({
                        ...template,
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
            const initialData = {};
            template.fields.forEach(field => {
                if (field) { 
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

        if (!selectedTemplate) {
            setError("Please select an activity template.");
            setShowError(true);
            return;
        }
        
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
            await api.post('/submissions', payload); // Calls POST /api/submissions
            
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
            
            {/* --- BACK TO DASHBOARD BUTTON (NEW) --- */}
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ mb: 3 }}
            >
                Back to Dashboard
            </Button>
            
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
                                disabled={isLoading || !proofFiles.length} 
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