import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Stack,
  Card,
  Grid,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AttachMoney,
  AccessTime,
  Directions,
  Map,
} from '@mui/icons-material';

const TripSummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formTripData = location.state?.tripData;

  // Mock data for trip summary
  const mockTripData = {
    destination: 'Istanbul, Turkey',
    startDate: '2024-04-15',
    endDate: '2024-04-22',
    budget: 1500,
    interests: ['History', 'Culture', 'Shopping'],
    itinerary: [
      {
        day: 1,
        date: '2024-04-15',
        activities: [
          {
            time: '10:00',
            name: 'Hagia Sophia',
            type: 'museum',
            duration: '2 hours',
          },
          {
            time: '13:00',
            name: 'Lunch at Sultanahmet Köftecisi',
            type: 'restaurant',
            duration: '1 hour',
          },
          {
            time: '15:00',
            name: 'Blue Mosque',
            type: 'museum',
            duration: '1.5 hours',
          },
        ],
      },
      {
        day: 2,
        date: '2024-04-16',
        activities: [
          {
            time: '09:00',
            name: 'Topkapi Palace',
            type: 'museum',
            duration: '3 hours',
          },
          {
            time: '14:00',
            name: 'Grand Bazaar',
            type: 'shopping',
            duration: '2 hours',
          },
        ],
      },
    ],
  };

  // Use form data if available, otherwise use mock data
  const tripData = formTripData ? {
    ...mockTripData,
    destination: formTripData.destination,
    startDate: formTripData.startDate instanceof Date 
      ? formTripData.startDate.toISOString().split('T')[0]
      : formTripData.startDate,
    endDate: formTripData.endDate instanceof Date 
      ? formTripData.endDate.toISOString().split('T')[0]
      : formTripData.endDate,
    budget: formTripData.budget,
    interests: formTripData.interests,
  } : mockTripData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Trip Summary
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Map />}
            onClick={() => navigate('/map', { state: { tripData } })}
          >
            View on Map
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Trip Details
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText primary="Destination" secondary={tripData.destination} />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dates"
                      secondary={`${tripData.startDate} to ${tripData.endDate}`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText primary="Budget" secondary={`$${tripData.budget}`} />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary="Duration"
                      secondary={`${tripData.itinerary.length} days`}
                    />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Interests
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {tripData.interests.map((interest: string, index: number) => (
                      <Chip key={index} label={interest} size="small" />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Daily Itinerary
                </Typography>
                {tripData.itinerary.map((day) => (
                  <Box key={day.day} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Day {day.day} - {day.date}
                    </Typography>
                    <List>
                      {day.activities.map((activity, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {activity.time}
                                  </Typography>
                                  <Typography variant="body1">{activity.name}</Typography>
                                  <Chip
                                    label={activity.type}
                                    size="small"
                                    sx={{ ml: 'auto' }}
                                  />
                                </Box>
                              }
                              secondary={`Duration: ${activity.duration}`}
                            />
                            <Button
                              size="small"
                              startIcon={<Directions />}
                              sx={{ ml: 2 }}
                            >
                              Directions
                            </Button>
                          </ListItem>
                          {index < day.activities.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                ))}
              </Paper>
            </Card>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TripSummary; 