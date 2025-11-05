import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Container, Box, Typography, Button, Alert, Link as MUILink, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StyledInput from '../components/ui/StyledInput'; // Your reusable input
import { API } from '../stores/authStore'; // Your configured Axios instance

// Mock Departments list
const DEPARTMENTS = [
  { value: 'CSE', label: 'Computer Science' },
  { value: 'ECE', label: 'Electronics & Comm.' },
  { value: 'MECH', label: 'Mechanical Engineering' },
  { value: 'IT', label: 'Information Technology' },
];

const RegisterPage = () => {
  // 1. UPDATED useForm destructuring
  const { 
    handleSubmit, 
    control, 
    setError, 
    clearErrors, // <-- Added
    reset, 
    formState: { isSubmitting, errors } // <-- Added 'errors'
  } = useForm();
  
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(null);

  React.useEffect(() => {
    reset();
  }, [reset]);

  // 2. UPDATED onSubmit function
  const onSubmit = async (data) => {
    setSuccessMessage(null);
    clearErrors('apiError'); // <-- Moved here and changed to clearErrors
    
    try {
      // Call signup API with default role as 'user'
      await API.post('/auth/signup', {
        ...data,
        role: 'user'
      });

      // Show success message and redirect
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Registration Error:', error);

      const errorMessage = error.response?.data?.message ||
        (error.message === 'Network Error'
          ? 'Cannot connect to the server. Please try again.'
          : 'Registration failed. Please check your details and try again.');

      setError('apiError', {
        type: 'manual',
        message: errorMessage
      });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
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
        <PersonAddIcon sx={{ m: 1, color: 'primary.main', fontSize: 40 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Register Account
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* 3. UPDATED Error Alert */}
        {errors.apiError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {errors.apiError.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
          {/* Name Input */}
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: 'Full Name is required' }}
            render={({ field, fieldState: { error } }) => (
              <StyledInput
                {...field}
                label="Full Name"
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ required: 'Email is required' }}
            render={({ field, fieldState: { error } }) => (
              <StyledInput
                {...field}
                label="Email Address"
                type="email"
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: 'Password is required' }}
            render={({ field, fieldState: { error } }) => (
              <StyledInput
                {...field}
                label="Password"
                type="password"
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
          />

          {/* Department Select Input */}
          <Controller
            name="department"
            control={control}
            defaultValue={DEPARTMENTS[0].value} // Set a default value
            rules={{ required: 'Department is required' }}
            render={({ field, fieldState: { error } }) => (
              <StyledInput
                {...field}
                select
                label="Department"
                error={!!error}
                helperText={error ? error.message : null}
              >
                {DEPARTMENTS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </StyledInput>
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
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
          <MUILink component={Link} to="/login" variant="body2" color="secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Already have an account? Sign in
          </MUILink>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;