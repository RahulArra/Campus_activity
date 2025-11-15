import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Container, Box, Typography, Button, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StyledInput from '../components/ui/StyledInput';
import useAuthStore from '../stores/authStore';
import LockIcon from '@mui/icons-material/Lock';

const ChangePasswordPage = () => {
  const { handleSubmit, control, setError, clearErrors, formState: { errors } } = useForm();
  const { changePassword, user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (onChange) => (e) => {
    onChange(e);
    if (errors.apiError) {
      clearErrors('apiError');
    }
  };

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }

    setSubmitting(true);
    try {
      clearErrors('apiError');
      const result = await changePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        // Update user in store and localStorage to reflect passwordChanged: true
        const updatedUser = { ...user, passwordChanged: true };
        updateUser(updatedUser);
        // Navigate to dashboard or appropriate page based on role
        if (user.role === 'superadmin') {
          navigate('/superadmin/departments');
        } else if (user.role === 'admin') {
          navigate('/admin/templates');
        } else if (user.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (user.role === 'deptadmin') {
          navigate('/dept-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('apiError', {
          type: 'manual',
          message: result.message,
        });
      }
    } catch (error) {
      setError('apiError', {
        type: 'manual',
        message: 'An unexpected error occurred',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <LockIcon sx={{ m: 1, color: 'primary.main', fontSize: 40 }} />
            <Typography component="h1" variant="h5">
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Please change your password to continue using the system.
            </Typography>
          </Box>

          {errors.apiError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {errors.apiError.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Controller
              name="currentPassword"
              control={control}
              defaultValue=""
              rules={{ required: 'Current password is required' }}
              render={({ field, fieldState }) => (
                <StyledInput
                  {...field}
                  onChange={handleInputChange(field.onChange)}
                  label="Current Password"
                  type="password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  autoComplete="current-password"
                />
              )}
            />

            <Controller
              name="newPassword"
              control={control}
              defaultValue=""
              rules={{
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              }}
              render={({ field, fieldState }) => (
                <StyledInput
                  {...field}
                  onChange={handleInputChange(field.onChange)}
                  label="New Password"
                  type="password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  autoComplete="new-password"
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              rules={{ required: 'Please confirm your new password' }}
              render={({ field, fieldState }) => (
                <StyledInput
                  {...field}
                  onChange={handleInputChange(field.onChange)}
                  label="Confirm New Password"
                  type="password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  autoComplete="new-password"
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
              {submitting ? 'Changing Password...' : 'Change Password'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChangePasswordPage;
