import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { AccessTime, AttachMoney, Star } from '@mui/icons-material';

interface Attraction {
  id: number;
  name: string;
  score: number;
  budget: number;
  time: number;
  location: [number, number];
  category: string;
}

interface TripPlan {
  attractions: Attraction[];
  score: number;
  budget: number;
  time: number;
  fitness: number;
  violations: number;
}

interface TripPlansProps {
  plans: TripPlan[];
}

const TripPlans: React.FC<TripPlansProps> = ({ plans }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<TripPlan | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Get top 3 plans (they should already be sorted by fitness)
  const topPlans = plans.slice(0, 3);

  const handlePlanClick = (plan: TripPlan) => {
    setSelectedPlan(plan);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlan(null);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const transformPlanToTripData = (plan: TripPlan) => {
    // Get unique categories from attractions
    const categories = Array.from(new Set(plan.attractions.map(a => a.category)));
    
    // Calculate total days needed (assuming 8 hours of activities per day)
    const totalHours = plan.time / 60;
    const daysNeeded = Math.max(Math.ceil(totalHours / 8), Math.ceil(plan.attractions.length / 3));
    
    // Create itinerary
    const itinerary = [];
    let currentDay = 1;
    let currentDate = new Date();
    let remainingAttractions = [...plan.attractions];
    
    while (remainingAttractions.length > 0 && currentDay <= daysNeeded) {
      const dayAttractions = remainingAttractions.splice(0, 3); // Take up to 3 attractions per day
      const activities = dayAttractions.map((attraction, index) => ({
        time: `${9 + index * 2}:00`, // Start at 9 AM, 2 hours apart
        name: attraction.name,
        type: attraction.category,
        duration: formatTime(attraction.time),
        location: attraction.location
      }));

      itinerary.push({
        day: currentDay,
        date: currentDate.toISOString().split('T')[0],
        activities
      });

      currentDay++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      destination: "Paris, France", // This should come from the planner
      startDate: itinerary[0].date,
      endDate: itinerary[itinerary.length - 1].date,
      budget: plan.budget,
      interests: categories,
      itinerary
    };
  };

  const handleSelectPlan = (plan: TripPlan) => {
    const tripData = transformPlanToTripData(plan);
    
    // Save trip to localStorage
    const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    const newTrip = {
      ...tripData,
      id: Date.now().toString(), // Generate a unique ID
    };
    savedTrips.push(newTrip);
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    
    navigate('/summary', { state: { tripData } });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Recommended Trip Plans
      </Typography>
      <Grid container spacing={3}>
        {topPlans.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => handlePlanClick(plan)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Plan {index + 1}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Star sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="body1">
                    Score: {plan.score.toFixed(1)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ color: 'green', mr: 1 }} />
                  <Typography variant="body1">
                    Budget: ${plan.budget}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ color: 'blue', mr: 1 }} />
                  <Typography variant="body1">
                    Duration: {formatTime(plan.time)}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Attractions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {plan.attractions.slice(0, 3).map((attraction) => (
                    <Chip
                      key={attraction.id}
                      label={attraction.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {plan.attractions.length > 3 && (
                    <Chip
                      label={`+${plan.attractions.length - 3} more`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedPlan && (
          <>
            <DialogTitle>
              Trip Plan Details
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ color: 'gold', mr: 1 }} />
                      <Typography>Score: {selectedPlan.score.toFixed(1)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney sx={{ color: 'green', mr: 1 }} />
                      <Typography>Budget: ${selectedPlan.budget}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ color: 'blue', mr: 1 }} />
                      <Typography>Duration: {formatTime(selectedPlan.time)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="h6" gutterBottom>
                Attractions
              </Typography>
              <List>
                {selectedPlan.attractions.map((attraction, index) => (
                  <React.Fragment key={attraction.id}>
                    <ListItem>
                      <ListItemText
                        primary={attraction.name}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Chip
                              label={attraction.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="body2">
                              Score: {attraction.score}
                            </Typography>
                            <Typography variant="body2">
                              Budget: ${attraction.budget}
                            </Typography>
                            <Typography variant="body2">
                              Time: {formatTime(attraction.time)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < selectedPlan.attractions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleSelectPlan(selectedPlan)}
              >
                Select This Plan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TripPlans; 