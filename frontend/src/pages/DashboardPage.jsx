import React, { useState, useEffect, useCallback } from 'react'; 
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuthStore, { API } from '../stores/authStore';
import CustomTable from '../components/ui/CustomTable'; 
import FilterBar from '../components/ui/FilterBar'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ templateType: '', dateRange: { from: null, to: null } });

const fetchSubmissions = useCallback(async () => {
  if (!user) return; // Prevent running when user is null

  setLoading(true);
  setError(null);

  try {
    const userId = user.id;
    if (!userId) throw new Error("User ID is missing.");

    let query = `?userId=${userId}`;
    if (filters.templateType) query += `&templateId=${filters.templateType}`;
    if (filters.dateRange.from) query += `&from=${filters.dateRange.from}`; 
    if (filters.dateRange.to) query += `&to=${filters.dateRange.to}`; 

    const response = await API.get(`/submissions${query}`); 
    setSubmissions(response.data);
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    const errorMessage = err.message === 'Network Error'
      ? 'Cannot connect to the server. Ensure the backend is running and CORS is configured.'
      : err.response?.data?.message || 'Could not load your activities.';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}, [user, filters]);


useEffect(() => {
  if (user) fetchSubmissions();
}, [fetchSubmissions, user]);

  const handleViewDetails = (submissionId) => {
    navigate(`/activity/view/${submissionId}`);
  };

  const tableHeaders = [
    { id: 'templateName', label: 'Activity Type' },
    { id: 'date', label: 'Date Submitted' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions', align: 'right' },
  ];
  
  // FINAL FIX: Robust data mapping for MongoDB population
  const tableRows = submissions.map(sub => {
    // 1. SAFELY EXTRACT TEMPLATE NAME (handles populated object under several possible keys)
    let activityName = 'N/A';

    const extractFromObj = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      return obj.templateName || obj.name || obj._id || null;
    };

    // Try commonly used fields in order of likelihood
    if (typeof sub.templateName === 'string') {
      activityName = sub.templateName;
    } else if (typeof sub.templateName === 'object' && sub.templateName !== null) {
      activityName = extractFromObj(sub.templateName) || 'Unknown Activity';
    } else if (typeof sub.templateId === 'string') {
      activityName = sub.templateId;
    } else if (typeof sub.templateId === 'object' && sub.templateId !== null) {
      activityName = extractFromObj(sub.templateId) || 'Unknown Activity';
    } else if (typeof sub.template === 'object' && sub.template !== null) {
      activityName = extractFromObj(sub.template) || 'Unknown Activity';
    } else {
      activityName = 'Unknown Activity';
    }
    
    return ({
        // MongoDB documents use '_id' for front-end consistency
        id: sub._id, 
        
        templateName: activityName, 
        
        // Date: Use createdAt (MongoDB timestamp)
        date: sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : (sub.submissionDate || 'N/A'), 
        
        // Status: Submissions should have a status field.
        status: sub.status || 'Pending Review', 

        actions: (
            <Button 
                variant="outlined" 
                size="small" 
                onClick={() => handleViewDetails(sub._id)}
            >
                View Details
            </Button>
        )
    });
  });


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 1, color: 'primary.main' }} />
            My Dashboard
        </Typography>
        <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/activity/add')} 
        >
            Add New Activity
        </Button>
      </Box>

      <FilterBar filters={filters} setFilters={setFilters} /> 
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            Submitted Activities
          </Typography>
          
          {/* Loading/Error/Data Display */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : submissions.length > 0 ? (
            <CustomTable 
              headers={tableHeaders} 
              rows={tableRows}
            />
          ) : (
             <Alert severity="info">You haven't submitted any activities yet.</Alert>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;