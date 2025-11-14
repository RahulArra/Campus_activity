// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ActivityViewPage from './pages/ActivityViewPage';
import ActivityAddPage from './pages/ActivityAddPage';
import PrivateRoute from './components/common/PrivateRoute';
import PrivateAdminRoute from './components/common/PrivateAdminRoute';
import PrivateSuperAdminRoute from './components/common/PrivateSuperAdminRoute';
import AdminTemplateCRUD from './admin/AdminTemplateCRUD';
import AdminSubmissionsView from './admin/AdminSubmissionsView';
import SuperAdminLayout from './superadmin/SuperAdminLayout';
import Departments from './superadmin/Departments';
import BulkUpload from './superadmin/BulkUpload';
import Students from './superadmin/Students';
import Teachers from './superadmin/Teachers';
import SuperAdminReports from './superadmin/SuperAdminReports';

const App = () => (
  <Router>
    <Routes>
      {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
      <Route path="/" element={<LoginPage />} />       {/* cite: 8 */}
    <Route path="/login" element={<LoginPage />} />  {/* ✅ add this */}
      <Route path="/register" element={<RegisterPage />} /> {/* cite: 9 */}
      
      {/* Protected Routes (Use PrivateRoute as the wrapper) */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/activity/view/:id" element={<ActivityViewPage />} />
        <Route path="/activity/add" element={<ActivityAddPage />} />
      </Route>

      {/* Admin Routes (Use PrivateAdminRoute for admin-only access) */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin/*" element={<PrivateAdminRoute>
          <Routes>
            <Route path="templates" element={<AdminTemplateCRUD />} />
            <Route path="reports" element={<AdminSubmissionsView />} />
          </Routes>
        </PrivateAdminRoute>} />
      </Route>

      {/* Super Admin Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/superadmin/departments" element={<Departments />} />
        <Route path="/superadmin/bulk-upload" element={<BulkUpload />} />
        <Route path="/superadmin/students" element={<Students />} />
        <Route path="/superadmin/teachers" element={<Teachers />} />
        <Route path="/superadmin/reports" element={<SuperAdminReports />} />
        <Route path="/admin/templates" element={<AdminTemplateCRUD />} />
      </Route>
    </Routes>
  </Router>
);

export default App;