import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

import { API } from '../stores/authStore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // -------------------------
  // 🔹 File Select
  // -------------------------
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid CSV file (.csv)");
      setFile(null);
    }
  };

  // -------------------------
  // 🔹 Download Template
  // -------------------------
  const downloadTemplate = () => {
    if (!selectedTemplate) {
      setError("Please select a template type first");
      return;
    }

    let csvContent = "";

    if (selectedTemplate === "students") {
      csvContent =
        "name,email,rollNo,department,section,year,role\n" +
        "Rahul Arra,rahul@example.com,210003,IT,A,3,student\n";
    }

    if (selectedTemplate === "teachers") {
      csvContent =
        "name,email,teacherId,department,classTeacher,assignedSection,assignedYear,role\n" +
        "Laxman Rao,laxman@example.com,T001,IT,true,2,3,teacher\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTemplate}_template.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  };

  // -------------------------
  // 🔹 Upload CSV to Backend
  // -------------------------
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/superadmin/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Bulk Upload Users
      </Typography>

      {/* Template Selector */}
      <FormControl sx={{ mb: 3, width: 250 }}>
        <InputLabel>Select Template</InputLabel>
        <Select
          value={selectedTemplate}
          label="Select Template"
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <MenuItem value="students">Student Template</MenuItem>
          <MenuItem value="teachers">Teacher Template</MenuItem>
        </Select>
      </FormControl>

      <Button variant="outlined" sx={{ ml: 2 }} onClick={downloadTemplate}>
        Download Template
      </Button>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {/* File Upload Box */}
      <Box sx={{ border: '2px dashed #ccc', p: 3, borderRadius: '8px', textAlign: 'center', mt: 3 }}>
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'block', margin: '1rem auto' }}
        />

        {file && <Typography variant="body2" color="success.main">Selected: {file.name}</Typography>}
      </Box>

      {/* Upload Button */}
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={loading || !file}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : "Upload"}
      </Button>

      {/* Response Table */}
      {response && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Upload completed: {response.success} success, {response.errors.length} failed
          </Alert>

          {response.errors.length > 0 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#ffebee' }}>
                    <TableCell>Row</TableCell>
                    <TableCell>Error</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {response.errors.map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{err.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BulkUpload;
