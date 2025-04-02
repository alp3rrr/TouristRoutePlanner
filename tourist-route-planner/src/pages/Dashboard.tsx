import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
} from '@mui/material';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Touristic Route Planner
      </Typography>
      <Typography variant="body1" paragraph>
        Plan your perfect trip with our intelligent route planner.
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 3,
        mt: 2 
      }}>
        <Box>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
              },
            }}
            onClick={() => navigate('/planner')}
          >
            <Typography variant="h6" gutterBottom>
              Plan New Trip
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Create a personalized trip plan based on your preferences
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
              },
            }}
            onClick={() => navigate('/saved-trips')}
          >
            <Typography variant="h6" gutterBottom>
              Saved Trips
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              View and manage your saved trip plans
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
              },
            }}
            onClick={() => navigate('/profile')}
          >
            <Typography variant="h6" gutterBottom>
              Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Manage your account and preferences
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 