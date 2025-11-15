import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { API } from '../stores/authStore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await API.post('/superadmin/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResponse(res.data);
      setFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Bulk Upload Users
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ border: '2px dashed #ccc', p: 3, borderRadius: '8px', textAlign: 'center', mb: 3 }}>
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'block', margin: '1rem auto' }}
        />
        {file && <Typography variant="body2" color="success.main">Selected: {file.name}</Typography>}
      </Box>

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Upload'}
      </Button>

      {response && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Upload completed: {response.success} success, {response.failed} failed
          </Alert>

          {response.errors && response.errors.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Errors</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#ffebee' }}>
                      <TableCell>Email</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.errors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{err.row?.email || 'N/A'}</TableCell>
                        <TableCell>{err.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BulkUpload;
