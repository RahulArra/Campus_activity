// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ActivityViewPage from './pages/ActivityViewPage';
import ActivityAddPage from './pages/ActivityAddPage';
import PrivateRoute from './components/common/PrivateRoute'; 
import AdminTemplateCRUD from './admin/AdminTemplateCRUD';
import AdminSubmissionsView from './admin/AdminSubmissionsView';

const App = () => (
  <Router>
    <Routes>
      {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
      <Route path="/" element={<LoginPage />} />       {/* cite: 8 */}
    <Route path="/login" element={<LoginPage />} />  {/* ✅ add this */}
      <Route path="/register" element={<RegisterPage />} /> {/* cite: 9 */}
      
      {/* Protected Routes (Use PrivateRoute as the wrapper) */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />           {/* cite: 10 */}
        <Route path="/activity/view/:id" element={<ActivityViewPage />} /> {/* cite: 11 */}
  {/* Admin routes */}
  <Route path="/admin/templates" element={<AdminTemplateCRUD />} />
  <Route path="/admin/reports" element={<AdminSubmissionsView />} />
      </Route>
      {/* Add a route for Rahul's Activity Submission: /activity/add */}
      <Route path="/activity/add" element={<ActivityAddPage />} />
    </Routes>
  </Router>
);

export default App;