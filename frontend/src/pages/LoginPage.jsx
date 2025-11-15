import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Container, Box, Typography, Button, Alert, Link as MUILink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import StyledInput from '../components/ui/StyledInput'; // Make sure this path is correct
import useAuthStore, { API } from '../stores/authStore'; // Make sure this path is correct
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const LoginPage = () => {
  const { handleSubmit, control, setError, clearErrors, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // This function clears the API error when the user types in a field
  const handleInputChange = (onChange) => (e) => {
    onChange(e); // This is the original react-hook-form onChange
    if (errors.apiError) {
      clearErrors('apiError'); // Clear the API error when the user types
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      clearErrors('apiError'); // Clear any previous errors on new submit
      const response = await API.post('/auth/login', data);
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (error) {
      setError('apiError', {
        type: 'manual',
        message: error.response?.data?.message || 'Login failed. Invalid email or password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'white',
        }}
      >
        <VpnKeyIcon sx={{ m: 1, color: 'primary.main', fontSize: 40 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>

        {errors.apiError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {errors.apiError.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          <Controller
            name="loginId"
            control={control}
            defaultValue=""
            rules={{
              required: 'Login ID is required',
            }}
            render={({ field, fieldState }) => (
              <StyledInput
                {...field}
                onChange={handleInputChange(field.onChange)} // <-- APPLIED FIX
                label="Login ID (Roll No for Students, Teacher ID for Teachers, Email for Admins)"
                type="text"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                autoComplete="username"
                autoFocus
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: 'Password is required' }}
            render={({ field, fieldState }) => (
              <StyledInput
                {...field}
                onChange={handleInputChange(field.onChange)} // <-- APPLIED FIX
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
            disabled={submitting}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </Button>

          <MUILink
            component={Link}
            to="/register"
            variant="body2"
            color="secondary"
            sx={{ display: 'block', textAlign: 'center' }}
          >
            Don't have an account? Register
          </MUILink>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;