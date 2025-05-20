import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { authApi } from '../services/api';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
});

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, error, setUser } = useAuth();
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setUpdateError(null);
      setUpdateSuccess(null);
      const noChange =
        values.firstName === user?.firstName &&
        values.lastName === user?.lastName &&
        (user?.dateOfBirth
          ? values.dateOfBirth?.toISOString().split('T')[0] === user.dateOfBirth
          : !values.dateOfBirth);
      if (noChange) {
        setUpdateSuccess('No changes to save.');
        return;
      }
      try {
        const response = await authApi.updateProfile({
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth?.toISOString().split('T')[0] || '',
        });
        if (response.data && response.data.firstName) {
          setUser(response.data);
        } else {
          setUser({
            ...user!,
            firstName: values.firstName,
            lastName: values.lastName,
            dateOfBirth: values.dateOfBirth?.toISOString().split('T')[0] || '',
          });
        }
        setUpdateSuccess('Profile updated successfully');
      } catch (err: any) {
        setUpdateError(err.response?.data || 'Failed to update profile');
      }
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: 32 }}>
            {formik.values.firstName?.[0] || 'U'}
          </Avatar>
          <Typography variant="h4">
            User Profile
          </Typography>
        </Box>
        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateError}
          </Alert>
        )}
        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {updateSuccess}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Date of Birth"
                value={formik.values.dateOfBirth}
                onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth),
                    helperText: formik.touched.dateOfBirth && formik.errors.dateOfBirth,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default UserProfile; 