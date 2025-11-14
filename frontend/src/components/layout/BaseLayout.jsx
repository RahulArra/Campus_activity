import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const BaseLayout = ({ children }) => (
  // Note: We use the fixed sidebar variant, so we don't need the toggleSidebar logic.
  <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Navbar /> 
      <Toolbar /> {/* Adds padding equal to Navbar height */}
      <Box sx={{ mt: 2 }}>
        {children}
      </Box>
      {/* Optional: Footer can be added here */}
    </Box>
  </Box>
);

export default BaseLayout;