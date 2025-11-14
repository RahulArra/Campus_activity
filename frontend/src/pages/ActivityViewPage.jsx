import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, CircularProgress, Alert, Button, Divider, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import { API } from '../stores/authStore'; 
import CustomCard from '../components/ui/CustomCard'; 

// Icon imports remain the same
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const StatusBadge = ({ status }) => {
    let color, icon;
    switch (status) {
        case 'Approved':
            color = 'success.main';
            icon = <CheckCircleOutlineIcon />;
            break;
        case 'Draft':
            color = 'warning.main';
            icon = <WorkOutlineIcon />;
            break;
        case 'Pending':
        default:
            color = 'info.main';
            icon = <CircularProgress size={16} sx={{ color: color, mr: 1 }} />;
            break;
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: '8px', bgcolor: `${color}10`, color: color, fontWeight: 600 }}>
            {icon}
            <Typography variant="subtitle1" sx={{ ml: 1 }}>{status}</Typography>
        </Box>
    );
};

const ActivityViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [id]);

    const fetchSubmissionDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await API.get(`/submissions/${id}`);
            setSubmission(response.data);

        } catch (err) {
            console.error("Failed to fetch activity details:", err);
            const errorMessage = err.message === 'Network Error' 
                ? 'Cannot connect to server. Check backend status (Naveen).'
                : err.response?.data?.message || 'Could not load activity details.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={60} color="primary" />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!submission) {
        return <Alert severity="info">Activity not found.</Alert>;
    }

    const formatSubmissionDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    
    // Helper function to capitalize and space out snake_case keys
    const formatLabel = (key) => {
        return key.replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .replace('Field', '');
    };
    
    const submissionData = submission.data || {};
    console.log(submissionData);
    const proofs = submission.proofs || [];
    const activityName = submission.templateName || (submission.templateId?.templateName) || 'Activity Submission'; 
    const submittedDate = submission.createdAt || submission.submittedAt;


    return (
        <Box sx={{ p: 2 }}>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ mb: 3 }}
            >
                Back to Dashboard
            </Button>

            <Grid container spacing={3}>
                {/* --- HEADER & STATUS (Left Column) --- */}
                <Grid item sx={{ width: { xs: '100%', md: '66.67%' } }}>
                    <CustomCard>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h5" color="primary.main" fontWeight={700}>
                                {activityName}
                            </Typography>
                            <StatusBadge status={submission.status || 'Unknown'} />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <WorkOutlineIcon sx={{ mr: 1 }} />
                                <Typography variant="body1">
                                    **Activity Title:** {submissionData.field_title || 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <CalendarMonthIcon sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                    Submitted: {submittedDate ? formatSubmissionDate(submittedDate) : 'N/A'}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* --- DYNAMIC FORM DATA DISPLAY --- */}
                        <Typography variant="h6" sx={{ mb: 1, mt: 3 }}>
                            Submission Details
                        </Typography>
                        <Grid container spacing={2}>
                            {Object.entries(submissionData).map(([key, value]) => (
                                key !== 'field_title' && ( 
                                    <Grid item xs={12} sm={6} key={key}>
                                        <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: '6px' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatLabel(key)}:
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {typeof value === 'object' && value !== null ? JSON.stringify(value) : value}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )
                            ))}
                        </Grid>
                    </CustomCard>
                </Grid>

                {/* --- PROOFS/ATTACHMENTS (Right Column) --- */}
                <Grid item sx={{ width: { xs: '100%', md: '50.33%' } }}>
                    <CustomCard title="Attached Proofs" sx={{ height: '100%' }}>
                        <List>
                            {proofs.length > 0 ? (
                                proofs.map((proof, index) => (
                                    <ListItem 
                                        key={index} 
                                        disablePadding 
                                        secondaryAction={
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                target="_blank" 
                                                href={proof.url} 
                                                rel="noopener noreferrer"
                                            >
                                                View
                                            </Button>
                                        }
                                    >
                                        <ListItemIcon>
                                            <AttachFileIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={proof.filename} 
                                            secondary={proof.fileType?.split('/')[1]?.toUpperCase() || 'File'} 
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No proof files were attached to this submission.
                                </Typography>
                            )}
                        </List>
                        {submission.status === 'Draft' && (
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="secondary" 
                                sx={{ mt: 3 }}
                                onClick={() => navigate(`/activity/edit/${submission._id}`)} 
                            >
                                Edit Draft Submission
                            </Button>
                        )}
                    </CustomCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ActivityViewPage;