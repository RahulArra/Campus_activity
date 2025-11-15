import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import ActivityViewPage from './pages/ActivityViewPage';
import ActivityAddPage from './pages/ActivityAddPage';
import DeptDashboard from './pages/DeptDashboard';
import DeptReports from "./pages/DeptReports";

import PrivateRoute from './components/common/PrivateRoute';
import PrivateAdminRoute from './components/common/PrivateAdminRoute';

import AdminTemplateCRUD from './admin/AdminTemplateCRUD';
import AdminSubmissionsView from './admin/AdminSubmissionsView';

import Departments from './superadmin/Departments';
import BulkUpload from './superadmin/BulkUpload';
import Students from './superadmin/Students';
import Teachers from './superadmin/Teachers';
import SuperAdminReports from './superadmin/SuperAdminReports';
import TeacherDashboard from './teacher/TeacherDashboard';

const App = () => (
  <Router>
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* -------------------------
          🔒 Protected Routes
      -------------------------- */}
      <Route element={<PrivateRoute />}>

        {/* Change Password Route */}
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* General User Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/activity/view/:id" element={<ActivityViewPage />} />
        <Route path="/activity/add" element={<ActivityAddPage />} />

        {/* ⭐ Dept Admin Routes */}
        <Route path="/dept-dashboard" element={<DeptDashboard />} />
        <Route path="/dept-reports" element={<DeptReports />} />

      </Route>

      {/* -------------------------
          🔒 Admin-only Routes
      -------------------------- */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/admin/*"
          element={
            <PrivateAdminRoute>
              <Routes>
                <Route path="templates" element={<AdminTemplateCRUD />} />
                <Route path="reports" element={<AdminSubmissionsView />} />
              </Routes>
            </PrivateAdminRoute>
          }
        />
      </Route>

      {/* -------------------------
          🔒 Super Admin Routes
      -------------------------- */}
      <Route element={<PrivateRoute />}>

        <Route path="/superadmin/departments" element={<Departments />} />
        <Route path="/superadmin/bulk-upload" element={<BulkUpload />} />
        <Route path="/superadmin/students" element={<Students />} />
        <Route path="/superadmin/teachers" element={<Teachers />} />
        <Route path="/superadmin/reports" element={<SuperAdminReports />} />

        {/* Superadmin needs access to admin templates */}
        <Route path="/admin/templates" element={<AdminTemplateCRUD />} />

      </Route>

      {/* -------------------------
          🔒 Teacher Routes
      -------------------------- */}
      <Route element={<PrivateRoute />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      </Route>

    </Routes>
  </Router>
);

export default App;
