import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Slider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import LoadingOverlay from '../components/LoadingOverlay';
import { useNotification } from '../contexts/NotificationContext';

interface TripFormValues {
  destination: string;
  interests: string[];
  budget: number;
  startDate: Date;
  endDate: Date;
}

const interests = [
  'History',
  'Art',
  'Nature',
  'Food',
  'Shopping',
  'Architecture',
  'Nightlife',
  'Sports',
  'Culture',
  'Beaches',
];

const validationSchema = Yup.object({
  destination: Yup.string().required('Destination is required'),
  interests: Yup.array()
    .min(1, 'Select at least one interest')
    .required('Interests are required'),
  budget: Yup.number()
    .min(0, 'Budget must be positive')
    .required('Budget is required'),
  startDate: Yup.date()
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
});

const TripPlanner: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik<TripFormValues>({
    initialValues: {
      destination: '',
      interests: [],
      budget: 1000,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSuccess('Trip plan created successfully!');
        navigate('/summary', { state: { tripData: values } });
      } catch (error) {
        showError('Failed to create trip plan. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Plan Your Trip
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="destination"
                name="destination"
                label="Destination"
                value={formik.values.destination}
                onChange={formik.handleChange}
                error={formik.touched.destination && Boolean(formik.errors.destination)}
                helperText={formik.touched.destination && formik.errors.destination}
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.interests && Boolean(formik.errors.interests)}>
                <InputLabel id="interests-label">Interests</InputLabel>
                <Select
                  labelId="interests-label"
                  id="interests"
                  name="interests"
                  multiple
                  value={formik.values.interests}
                  onChange={formik.handleChange}
                  label="Interests"
                  disabled={isSubmitting}
                >
                  {interests.map((interest) => (
                    <MenuItem key={interest} value={interest}>
                      {interest}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.interests && formik.errors.interests && (
                  <FormHelperText>{formik.errors.interests}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Budget (USD)</Typography>
              <Slider
                value={formik.values.budget}
                onChange={(_, value) => formik.setFieldValue('budget', value)}
                valueLabelDisplay="auto"
                step={100}
                marks
                min={0}
                max={5000}
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    helperText: (formik.touched.startDate && formik.errors.startDate) ? String(formik.errors.startDate) : '',
                    disabled: isSubmitting
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.endDate && Boolean(formik.errors.endDate),
                    helperText: (formik.touched.endDate && formik.errors.endDate) ? String(formik.errors.endDate) : '',
                    disabled: isSubmitting
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Planning Trip...' : 'Plan Trip'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      <LoadingOverlay open={isSubmitting} message="Creating your trip plan..." />
    </Container>
  );
};

export default TripPlanner; 