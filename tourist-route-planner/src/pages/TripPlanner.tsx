import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import dayjs from 'dayjs';

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

  const handleSubmit = async (values: {
    destination: string;
    interests: string[];
    budget: number;
    startDate: Date;
    endDate: Date;
  }) => {
    try {
      // TODO: Implement actual trip planning logic with backend
      console.log('Trip planning values:', values);
      navigate('/map');
    } catch (error) {
      console.error('Trip planning error:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Plan Your Trip
        </Typography>
        <Formik
          initialValues={{
            destination: '',
            interests: [],
            budget: 1000,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
          }) => (
            <Form>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Box>
                  <TextField
                    fullWidth
                    id="destination"
                    name="destination"
                    label="Destination City"
                    value={values.destination}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.destination && Boolean(errors.destination)}
                    helperText={touched.destination && errors.destination}
                  />
                </Box>

                <Box>
                  <FormControl fullWidth>
                    <InputLabel id="interests-label">Interests</InputLabel>
                    <Select
                      labelId="interests-label"
                      id="interests"
                      name="interests"
                      multiple
                      value={values.interests}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.interests && Boolean(errors.interests)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {interests.map((interest) => (
                        <MenuItem key={interest} value={interest}>
                          {interest}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography gutterBottom>Budget (USD)</Typography>
                  <Slider
                    value={values.budget}
                    onChange={(_, value) => setFieldValue('budget', value)}
                    valueLabelDisplay="auto"
                    step={100}
                    marks
                    min={0}
                    max={10000}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={values.startDate}
                        onChange={(date) => setFieldValue('startDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: touched.startDate && Boolean(errors.startDate),
                            helperText: touched.startDate && errors.startDate as string,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  <Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="End Date"
                        value={values.endDate}
                        onChange={(date) => setFieldValue('endDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: touched.endDate && Boolean(errors.endDate),
                            helperText: touched.endDate && errors.endDate as string,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>

                <Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Plan My Trip
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default TripPlanner; 