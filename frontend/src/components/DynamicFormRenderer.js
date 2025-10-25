// import React from 'react';

// function DynamicFormRenderer({ template, formData, onFormChange }) {
//   // This handler updates the parent's state
//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Pass the change up to the parent component
//     onFormChange(prevData => ({
//       ...prevData,
//       [name]: value
//     }));
//   };

//   // Helper function to render the correct input based on field type
//   const renderField = (field) => {
//     const { id, label, type, required, options } = field;
//     // Get value from parent's state. Use ?? '' for null/undefined.
//     const value = formData[id] ?? ''; 

//     switch (type) {
//       case 'text':
//       case 'number':
//       case 'date':
//         return (
//           <input
//             type={type}
//             id={id}
//             name={id} // 'name' is how we identify the field
//             value={value}
//             onChange={handleChange}
//             required={required}
//           />
//         );
//       case 'textarea':
//         return (
//           <textarea
//             id={id}
//             name={id}
//             value={value}
//             onChange={handleChange}
//             required={required}
//           />
//         );
//       case 'select':
//         return (
//           <select
//             id={id}
//             name={id}
//             value={value}
//             onChange={handleChange}
//             required={required}
//           >
//             <option value="">-- Select {label} --</option>
//             {options.map(option => (
//               <option key={option} value={option}>{option}</option>
//             ))}
//           </select>
//         );
//       default:
//         return <p>Unsupported field type: {type}</p>;
//     }
//   };

//   // --- THIS IS THE FIX ---
//   // A component MUST return a single root element.
//   // We wrap the .map() in a React Fragment: <> ... </>
//   return (
//     <>
//       {template.fields.map(field => (
//         <div key={field.id} style={{ marginBottom: '15px' }}>
//           <label htmlFor={field.id} style={{ display: 'block', marginBottom: '5px' }}>
//             {field.label}
//             {field.required && <span style={{ color: 'red' }}>*</span>}
//           </label>
//           {renderField(field)}
//         </div>
//       ))}
//     </>
//   );
// }

// export default DynamicFormRenderer;


// import React, { useState, useEffect } from 'react';

// function DynamicFormRenderer({ template, onFormChange }) {
//   const [formData, setFormData] = useState({});

//   useEffect(() => {
//     if (template?.fields) {
//       const initialForm = {};
//       template.fields.forEach(field => initialForm[field.fieldId] = '');
//       setFormData(initialForm);
//       onFormChange(initialForm);
//     }
//   }, [template]);

//   const updateValue = (fieldId, value) => {
//     const updated = { ...formData, [fieldId]: value };
//     setFormData(updated);
//     onFormChange(updated);
//   };

//   const renderField = (field) => {
//     const { fieldId, label, type, required, options } = field;

//     switch (type) {
//       case "text":
//       case "number":
//       case "date":
//         return (
//           <div key={fieldId}>
//             <label>{label}{required ? " *" : ""}</label>
//             <input
//               type={type}
//               value={formData[fieldId] || ""}
//               required={required}
//               onChange={(e) => updateValue(fieldId, e.target.value)}
//             />
//           </div>
//         );

//       case "textarea":
//         return (
//           <div key={fieldId}>
//             <label>{label}{required ? " *" : ""}</label>
//             <textarea
//               value={formData[fieldId] || ""}
//               required={required}
//               onChange={(e) => updateValue(fieldId, e.target.value)}
//             />
//           </div>
//         );

//       case "select":
//         return (
//           <div key={fieldId}>
//             <label>{label}{required ? " *" : ""}</label>
//             <select
//               value={formData[fieldId] || ""}
//               required={required}
//               onChange={(e) => updateValue(fieldId, e.target.value)}
//             >
//               <option value="">Select</option>
//               {options.map(opt => (
//                 <option key={opt} value={opt}>{opt}</option>
//               ))}
//             </select>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       {template?.fields?.map(field => renderField(field))}
//     </div>
//   );
// }

// export default DynamicFormRenderer;

import React from 'react';

// This component is now "dumb" and just receives props.
// It gets the form data *from* the parent.
function DynamicFormRenderer({ template, formData, onFormChange }) {

  // This simple handler tells the parent to update its state
  const handleChange = (e) => {
    const { name, value } = e.target;
    // We call the parent's state setter function directly
    onFormChange(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const renderField = (field) => {
    // We use fieldId, just like in your working code
    const { fieldId, label, type, required, options } = field;

    // The value comes from the 'formData' prop
    const value = formData[fieldId] ?? '';

    switch (type) {
      case "text":
      case "number":
      case "date":
        return (
          <div key={fieldId}>
            <label>{label}{required ? " *" : ""}</label>
            <input
              type={type}
              id={fieldId}
              name={fieldId} // 'name' MUST match the state key (fieldId)
              value={value}
              required={required}
              onChange={handleChange}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={fieldId}>
            <label>{label}{required ? " *" : ""}</label>
            <textarea
              id={fieldId}
              name={fieldId}
              value={value}
              required={required}
              onChange={handleChange}
            />
          </div>
        );

      case "select":
        return (
          <div key={fieldId}>
            <label>{label}{required ? " *" : ""}</label>
            <select
              id={fieldId}
              name={fieldId}
              value={value}
              required={required}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* We add .filter(Boolean) to prevent crashes if the API data is bad */}
      {template?.fields?.filter(Boolean).map(field => renderField(field))}
    </div>
  );
}

export default DynamicFormRenderer;