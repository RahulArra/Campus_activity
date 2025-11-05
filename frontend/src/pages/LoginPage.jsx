import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Container, Box, Typography, Button, Alert, Link as MUILink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import StyledInput from '../components/ui/StyledInput';
import useAuthStore, { API } from '../stores/authStore';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const LoginPage = () => {
  // We explicitly use the necessary RHF hooks
  const { handleSubmit, control, setError, formState: { isSubmitting, errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Clear any previous API errors
    setError('apiError', null);
    
    try {
      // 1. Call Naveen's API: POST /auth/login 
      const response = await API.post('/auth/login', data); 
      
      const { token, user } = response.data;

      // 2. Store JWT token and user details in state/localStorage 
      login(token, user); 
      
      // 3. Redirect to the protected dashboard route [cite: 10]
      navigate('/dashboard'); 

    } catch (error) {
      // 4. Handle login failure (e.g., 401 Unauthorized from backend)
      console.error('Login Error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        (error.message === 'Network Error' 
          ? 'Cannot connect to the backend server. Please ensure Naveen\'s API is running.' 
          : 'Login failed. Invalid email or password.');

      setError('apiError', { 
        type: 'manual', 
        message: errorMessage 
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ 
        marginTop: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: 4, 
        boxShadow: 3, 
        borderRadius: 2, 
        bgcolor: 'white' 
      }}>
        <VpnKeyIcon sx={{ m: 1, color: 'primary.main', fontSize: 40 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>

        {/* Display API Error if set */}
        {errors.apiError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {errors.apiError.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          {/* Email Input */}
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
            }}
            render={({ field, fieldState }) => (
                <StyledInput 
                    {...field}
                    label="Email Address" 
                    type="email" 
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    autoComplete="email" 
                    autoFocus
                />
            )}
          />
          
          {/* Password Input */}
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: 'Password is required' }}
            render={({ field, fieldState }) => (
                <StyledInput 
                    {...field}
                    label="Password" 
                    type="password" 
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    autoComplete="current-password" 
                />
            )}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
          <MUILink component={Link} to="/register" variant="body2" color="secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Don't have an account? Register 
          </MUILink>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;