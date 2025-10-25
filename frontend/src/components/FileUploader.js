import React, { useState } from 'react';
import api from '../services/api';

// Renamed props to match your state in SubmitActivity
function FileUploader({ proofs, setProofs }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file); // 'file' should match Shravan's backend
    
    try {
      // This will call Shravan's API: POST /api/uploads
      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Shravan's API should return an object like { url, filename, fileType }
      const fileData = response.data; 

      // Add the new file to the parent's state
      setProofs(currentProofs => [...currentProofs, fileData]);

    } catch (err) {
      console.error(err);
      setUploadError('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = null; // Clear the file input
    }
  };

  return (
    <div className="file-uploader">
      <input 
        type="file" 
        onChange={handleFileUpload} 
        disabled={isUploading}
        accept="image/png, image/jpeg, application/pdf"
      />
      {isUploading && <p>Uploading...</p>}
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}

      <div className="proof-list" style={{marginTop: '10px'}}>
        <strong>Uploaded files:</strong>
        {proofs.length === 0 ? (
          <p>No files uploaded.</p>
        ) : (
          <ul>
            {proofs.map((file, index) => (
              <li key={index}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.filename || `File ${index + 1}`}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FileUploader;