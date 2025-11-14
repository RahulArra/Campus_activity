import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// Define a beautiful, custom theme (Shiva's aesthetic touch!)
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A148C', // Deep Purple
    },
    secondary: {
      main: '#FFC107', // Amber
    },
    background: {
      default: '#f8f8fa', // Light background for the dashboard
    },
  },
  typography: {
    fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
    h5: {
      fontWeight: 600,
      color: '#4A148C',
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true, // No box shadow for a cleaner look
      },
    },
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* MUI's way to normalize CSS */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);