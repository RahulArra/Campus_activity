import React from 'react';

// This component is "dumb" and just receives props.
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
              minLength="3"      // --- ADDED: Good default for names/titles
              maxLength="250"    // --- ADDED: Prevents huge text inputs
            />
          </div>
        );

      case "number":
        return (
          <div key={fieldId}>
            <label>{label}{required ? " *" : ""}</label>
            <input
              type={type}
              id={fieldId}
              name={fieldId}
              value={value}
              required={required}
              onChange={handleChange}
              min="0"            // --- ADDED: Prevents negative numbers
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
              minLength="10"     // --- ADDED: Good for descriptions
              maxLength="1000"   // --- ADDED: Prevents massive text
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
      
      case "date": // --- ADDED: Split 'date' from 'text' for clarity
        return (
          <div key={fieldId}>
            <label>{label}{required ? " *" : ""}</label>
            <input
              type={type}
              id={fieldId}
              name={fieldId}
              value={value}
              required={required}
              onChange={handleChange}
            />
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