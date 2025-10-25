// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import DynamicFormRenderer from '../components/DynamicFormRenderer';

// function SubmitActivity() {
//   // 1. Holds the list of all templates (e.g., "Hackathon", "Workshop")
//   const [templates, setTemplates] = useState([]);
  
//   // 2. Holds the *single* template object the user selects
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
  
//   // 3. Holds the actual form data (e.g., {eventName: "TechFest"})
//   const [formData, setFormData] = useState({});

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   // --- TASK 1: Fetch Templates ---
//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         setIsLoading(true);
//         // This calls Naveen's API: GET /api/templates
//         const response = await api.get('/templates'); 
//         setTemplates(response.data);
//       } catch (err) {
//         console.error("Error fetching templates:", err);
//         setError('Failed to load activity templates. Is the backend running?');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchTemplates();
//   }, []); // Empty array means this runs only once

//   // --- Event Handlers ---

//   // When the user picks from the dropdown
//   const handleTemplateChange = (e) => {
//     const templateId = e.target.value;
//     const template = templates.find(t => t._id === templateId);
//     setSelectedTemplate(template || null);

//     // --- THIS IS THE FIX ---
//     // We must reset the form data state based on the *new* template
//     if (template) {
//       // Create a fresh, empty state object for the new form
//       const initialData = {};
//       template.fields.forEach(field => {
//         initialData[field.id] = '';
//       });
//       setFormData(initialData);
//     } else {
//       // If they select "-- Choose --", clear the form
//       setFormData({});
//     }
//   };
  
//   // This will be passed to the child component
//   const handleFormChange = (updater) => {
//     setFormData(updater);
//   };

//   // We will build this out in the next step
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Submitting this data:", {
//       templateId: selectedTemplate._id,
//       data: formData,
//       // proofs: ... (will come from Shravan)
//     });
//     // Here we will call: api.post('/submissions', ...)
//   };

//   if (isLoading) return <p>Loading templates...</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;

//   return (
//     <div>
//       <h2>Submit New Activity</h2>

//       {/* --- 1. Template Selector --- */}
//       <select onChange={handleTemplateChange} value={selectedTemplate ? selectedTemplate._id : ''}>
//         <option value="">-- Choose an activity --</option>
//         {templates.map(template => (
//           <option key={template._id} value={template._id}>
//             {template.name}
//           </option>
//         ))}
//       </select>

//       <hr />

//       {/* --- 2. Dynamic Form --- */}
//       {selectedTemplate && (
//         <form onSubmit={handleSubmit}>
//           <h3>{selectedTemplate.name}</h3>
          
//           <DynamicFormRenderer 
//             template={selectedTemplate}
//             formData={formData}
//             onFormChange={handleFormChange}
//           />
          
//           <button type="submit">Submit Activity</button>
//         </form>
//       )}
//     </div>
//   );
// }

// export default SubmitActivity;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import DynamicFormRenderer from '../components/DynamicFormRenderer';
// // import FileUploader from '../components/FileUploader';

// function SubmitActivity() {
//   const [templates, setTemplates] = useState([]);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [proofFiles, setProofFiles] = useState([]);
//   const [message, setMessage] = useState("");

// useEffect(() => {
//   axios.get('http://localhost:5000/api/templates')
//     .then(res => {
//       if (res.data && Array.isArray(res.data.templates)) {
//         setTemplates(res.data.templates);
//         console.log(res);
//       } else {
//         setTemplates([]);
//       }
//     })
//     .catch(err => {
//       console.error(err);
//       setTemplates([]);
//     });
// }, []);


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       templateId: selectedTemplate._id,
//       formData,
//       proofs: proofFiles.map(f => f.url) 
//     };

//     try {
//       const res = await axios.post('http://localhost:5000/api/submissions', payload);
//       setMessage("✅ Activity Submitted Successfully!");
//       setFormData({});
//       setProofFiles([]);
//     } catch (err) {
//       setMessage("❌ Submission Failed!");
//     }
//   };

//   return (
//     <div>
//       <h2>Submit Activity</h2>

// <select onChange={(e) => setSelectedTemplate(templates.find(t => t._id === e.target.value))}>
//   <option value="">Select Activity Template</option>
//   {templates?.map(t => (
//     <option key={t._id} value={t._id}>{t.name}</option>
//   ))}
// </select>


//       {selectedTemplate && (
//         <form onSubmit={handleSubmit}>
//           <DynamicFormRenderer template={selectedTemplate} onFormChange={setFormData} />

//           {/* <FileUploader files={proofFiles} setFiles={setProofFiles} /> */}

//           <button type="submit">Submit</button>
//         </form>
//       )}

//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// export default SubmitActivity;

import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Use our new api service
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import FileUploader from '../components/FileUploader'; // Import Shravan's component
import './SubmitActivity.css'; // <-- 1. IMPORT THE CSS
function SubmitActivity() {
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
    <div>
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

export default SubmitActivity;