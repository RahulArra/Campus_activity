import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReportIcon from '@mui/icons-material/Assessment';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import UploadIcon from '@mui/icons-material/CloudUpload';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const drawerWidth = 240;

const Sidebar = () => {
  const authStore = useAuthStore();
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Submit Activity', icon: <AddCircleIcon />, path: '/activity/add' },
    { text: 'Manage Templates', icon: <AdminPanelSettingsIcon />, path: '/admin/templates', admin: true },
    { text: 'View Reports', icon: <ReportIcon />, path: '/admin/reports', admin: true },
    { text: 'Departments', icon: <SupervisorAccountIcon />, path: '/superadmin/departments', superadmin: true },
    { text: 'Bulk Upload', icon: <UploadIcon />, path: '/superadmin/bulk-upload', superadmin: true },
    { text: 'Students', icon: <PeopleIcon />, path: '/superadmin/students', superadmin: true },
    { text: 'Teachers', icon: <SchoolIcon />, path: '/superadmin/teachers', superadmin: true },
  ];

  // Use the isAdmin and isSuperAdmin checks from auth store
  const isAdmin = authStore.isAdmin();
  const isSuperAdmin = authStore.isSuperAdmin();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'primary.dark' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
          Campus Tracker
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.filter(item => (!item.admin || isAdmin) && (!item.superadmin || isSuperAdmin)).map((item) => (
            <ListItem key={item.text} disablePadding sx={{ py: 0.5 }}>
              <ListItemButton 
                component={RouterLink} 
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main', // Highlight selected item
                    color: 'primary.main',
                    borderRadius: '8px',
                    margin: '0 8px',
                    '&:hover': {
                      bgcolor: 'secondary.light',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;