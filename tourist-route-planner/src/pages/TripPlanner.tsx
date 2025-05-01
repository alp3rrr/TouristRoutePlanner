import React from 'react';
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
  Chip,
  Checkbox,
  ListItemText,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Grid from '@mui/material/Grid';

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

  const formik = useFormik<TripFormValues>({
    initialValues: {
      destination: '',
      interests: [],
      budget: 1000,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
    validationSchema: Yup.object({
      destination: Yup.string().required('Destination is required'),
      interests: Yup.array().min(1, 'Select at least one interest'),
      budget: Yup.number().min(100, 'Minimum budget is 100'),
      startDate: Yup.date().required('Start date is required'),
      endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('End date is required'),
    }),
    onSubmit: (values) => {
      console.log('Trip values:', values);
      navigate('/summary', { state: { tripData: values } });
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
            <Grid size={12}>
              <TextField
                fullWidth
                id="destination"
                name="destination"
                label="Destination"
                value={formik.values.destination}
                onChange={formik.handleChange}
                error={formik.touched.destination && Boolean(formik.errors.destination)}
                helperText={formik.touched.destination && formik.errors.destination}
              />
            </Grid>
            <Grid size={12}>
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
            <Grid size={12}>
              <Typography gutterBottom>Budget (USD)</Typography>
              <Slider
                value={formik.values.budget}
                onChange={(_, value) => formik.setFieldValue('budget', value)}
                valueLabelDisplay="auto"
                step={100}
                marks
                min={0}
                max={5000}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <DatePicker
                label="Start Date"
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    helperText: formik.touched.startDate && String(formik.errors.startDate),
                  },
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <DatePicker
                label="End Date"
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.endDate && Boolean(formik.errors.endDate),
                    helperText: formik.touched.endDate && String(formik.errors.endDate),
                  },
                }}
              />
            </Grid>
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Plan Trip
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default TripPlanner; 