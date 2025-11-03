// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmitActivity from './pages/ActivityAddPage'; // Import your new page
import AdminTemplateCRUD from './admin/AdminTemplateCRUD';
import AdminSubmissionsView from './admin/AdminSubmissionsView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminSubmissionsView />} />
          <Route path="/admin/templates" element={<SubmitActivity />} />
          <Route path="/admin/submissions" element={<AdminTemplateCRUD/ >} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
