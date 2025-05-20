import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  AccessTime,
  AttachMoney,
  Star,
  Delete,
  Map,
  Search,
  Sort,
  FilterList,
} from '@mui/icons-material';

interface SavedTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  interests: string[];
  itinerary: {
    day: number;
    date: string;
    activities: {
      time: string;
      name: string;
      type: string;
      duration: string;
      location: [number, number];
    }[];
  }[];
}

type SortOption = 'date' | 'budget' | 'duration';
type SortOrder = 'asc' | 'desc';

const SavedTrips: React.FC = () => {
  const navigate = useNavigate();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const trips = localStorage.getItem('savedTrips');
      if (trips) {
        setSavedTrips(JSON.parse(trips));
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tripId: string) => {
    setTripToDelete(tripId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tripToDelete) {
      const updatedTrips = savedTrips.filter(trip => trip.id !== tripToDelete);
      setSavedTrips(updatedTrips);
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTripToDelete(null);
  };

  const handleViewTrip = (trip: SavedTrip) => {
    navigate('/summary', { state: { tripData: trip } });
  };

  const handleViewOnMap = (trip: SavedTrip) => {
    navigate('/map', { state: { tripData: trip } });
  };

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption);
  };

  const handleSortOrderChange = (event: SelectChangeEvent<SortOrder>) => {
    setSortOrder(event.target.value as SortOrder);
  };

  const filteredAndSortedTrips = savedTrips
    .filter(trip => 
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.interests.some(interest => 
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'budget':
          comparison = a.budget - b.budget;
          break;
        case 'duration':
          comparison = a.itinerary.length - b.itinerary.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Saved Trips
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search trips"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            label="Sort by"
            onChange={handleSortChange}
            startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="budget">Budget</MenuItem>
            <MenuItem value="duration">Duration</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Order</InputLabel>
          <Select
            value={sortOrder}
            label="Order"
            onChange={handleSortOrderChange}
            startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {filteredAndSortedTrips.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? 'No trips match your search.' : 'No saved trips yet. Plan a trip to get started!'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/planner')}
          >
            Plan a Trip
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedTrips.map((trip) => (
            <Grid item xs={12} md={6} lg={4} key={trip.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {trip.destination}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {trip.interests.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ color: 'green', mr: 1 }} />
                    <Typography variant="body2">
                      Budget: ${trip.budget}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ color: 'blue', mr: 1 }} />
                    <Typography variant="body2">
                      Duration: {trip.itinerary.length} days
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {trip.startDate} to {trip.endDate}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleViewTrip(trip)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Map />}
                    onClick={() => handleViewOnMap(trip)}
                  >
                    View on Map
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(trip.id)}
                    sx={{ ml: 'auto' }}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this trip? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavedTrips; 