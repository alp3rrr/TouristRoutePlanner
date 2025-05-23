import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
  LinearProgress,
  Fade,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepConnector,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  DirectionsWalk,
  DirectionsCar,
  DirectionsTransit,
  Restaurant,
  Hotel,
  Attractions,
  ShoppingBag,
  Event,
  Map,
  Timeline,
  Edit,
  Share,
  Download,
  Print,
  FilterList,
  Sort,
  WbSunny,
  Cloud,
  Opacity,
  Air,
  AttachMoney,
  DirectionsBus,
  DirectionsBike,
  LocalTaxi,
  Train,
  Search,
  NavigateBefore,
  NavigateNext,
  Close,
  Navigation,
  NavigateNextSharp,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import CloseIcon from '@mui/icons-material/Close';
import NavigationIcon from '@mui/icons-material/Navigation';
import { styled } from '@mui/material/styles';
import { stepConnectorClasses } from '@mui/material/StepConnector';

interface Activity {
  id: string;
  time: string;
  name: string;
  type: string;
  duration: string;
  location: [number, number];
  description: string;
  cost: number;
  rating: number;
  image?: string;
}

interface WeatherForecast {
  date: string;
  temperature: number;
  condition: string;
  icon: React.ReactNode;
}

interface Transportation {
  type: string;
  duration: string;
  cost: number;
  distance: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  weather?: WeatherForecast;
  transportation?: Transportation[];
}

interface ItineraryProps {
  tripData: {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    interests: string[];
    itinerary: DayPlan[];
  };
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '4px',
  overflow: 'hidden'
};

const markerSVGs: Record<string, string> = {
  attraction: `data:image/svg+xml;utf8,<svg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><ellipse cx='16' cy='13' rx='8' ry='8' fill='%23FF5252'/><rect x='14' y='13' width='4' height='12' rx='2' fill='%23FF5252'/><ellipse cx='16' cy='13' rx='3' ry='3' fill='white'/></svg>`,
  restaurant: `data:image/svg+xml;utf8,<svg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><ellipse cx='16' cy='13' rx='8' ry='8' fill='%234CAF50'/><rect x='14' y='13' width='4' height='12' rx='2' fill='%234CAF50'/><ellipse cx='16' cy='13' rx='3' ry='3' fill='white'/></svg>`,
  hotel: `data:image/svg+xml;utf8,<svg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><ellipse cx='16' cy='13' rx='8' ry='8' fill='%232196F3'/><rect x='14' y='13' width='4' height='12' rx='2' fill='%232196F3'/><ellipse cx='16' cy='13' rx='3' ry='3' fill='white'/></svg>`,
  shopping: `data:image/svg+xml;utf8,<svg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><ellipse cx='16' cy='13' rx='8' ry='8' fill='%23FFC107'/><rect x='14' y='13' width='4' height='12' rx='2' fill='%23FFC107'/><ellipse cx='16' cy='13' rx='3' ry='3' fill='white'/></svg>`,
  event: `data:image/svg+xml;utf8,<svg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><ellipse cx='16' cy='13' rx='8' ry='8' fill='%239C27B0'/><rect x='14' y='13' width='4' height='12' rx='2' fill='%239C27B0'/><ellipse cx='16' cy='13' rx='3' ry='3' fill='white'/></svg>`
};

const getMarkerIcon = (type: string) => {
  return markerSVGs[type] || markerSVGs['attraction'];
};

const Itinerary: React.FC<ItineraryProps> = ({ tripData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'time' | 'cost' | 'rating'>('time');
  const [isDayTransitioning, setIsDayTransitioning] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Activity | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Calculate total budget and spent amount
  const totalBudget = tripData.budget;
  const spentAmount = tripData.itinerary.reduce((total, day) => {
    return total + day.activities.reduce((dayTotal, activity) => {
      return dayTotal + (activity.cost || 0);
    }, 0);
  }, 0);

  // Filter activities for the selected day and apply search/filter/sort
  const filteredActivities = tripData.itinerary[selectedDay].activities
    .filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(activity.type);
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return a.time.localeCompare(b.time);
        case 'cost':
          return b.cost - a.cost;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  // Check if this is the last activity of the entire trip
  const isLastActivityOfTrip = selectedDay === tripData.itinerary.length - 1 && 
                             selectedActivityIndex === filteredActivities.length - 1;

  // Calculate remaining budget
  const remainingBudget = totalBudget - spentAmount;
  const budgetProgress = (spentAmount / totalBudget) * 100;

  const handleNextActivity = () => {
    setSelectedActivityIndex(prev => 
      Math.min(filteredActivities.length - 1, prev + 1)
    );
  };

  const handlePreviousActivity = () => {
    setSelectedActivityIndex(prev => Math.max(0, prev - 1));
  };

  const handleDayChange = (day: number) => {
    setIsDayTransitioning(true);
    setTimeout(() => {
      setSelectedDay(day);
      setSelectedActivityIndex(0);
      setIsDayTransitioning(false);
    }, 300);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'restaurant':
        return <Restaurant />;
      case 'hotel':
        return <Hotel />;
      case 'attraction':
        return <Attractions />;
      case 'shopping':
        return <ShoppingBag />;
      case 'event':
        return <Event />;
      default:
        return <DirectionsWalk />;
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <WbSunny />;
      case 'cloudy':
        return <Cloud />;
      case 'rainy':
        return <Opacity />;
      default:
        return <WbSunny />;
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'walking':
        return <DirectionsWalk />;
      case 'car':
        return <DirectionsCar />;
      case 'transit':
        return <DirectionsTransit />;
      case 'bus':
        return <DirectionsBus />;
      case 'bike':
        return <DirectionsBike />;
      case 'taxi':
        return <LocalTaxi />;
      case 'train':
        return <Train />;
      default:
        return <DirectionsWalk />;
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
  });

  const onMapClick = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const onMarkerClick = useCallback((activity: Activity) => {
    setSelectedMarker(activity);
  }, []);

  const center = useCallback(() => {
    if (filteredActivities.length > 0) {
      return {
        lat: filteredActivities[0].location[0],
        lng: filteredActivities[0].location[1]
      };
    }
    // Default to Paris center if no activities
    return {
      lat: 48.8566,
      lng: 2.3522
    };
  }, [filteredActivities]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }), []);

  const routePath = useMemo(() => {
    return filteredActivities.map(activity => ({
      lat: activity.location[0],
      lng: activity.location[1]
    }));
  }, [filteredActivities]);

  const handleViewOnMap = (activity: Activity) => {
    setViewMode('map');
    setSelectedMarker(activity);
    setMapCenter({ lat: activity.location[0], lng: activity.location[1] });
  };

  const handleGetDirections = (activity: Activity) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activity.location[0]},${activity.location[1]}`;
    window.open(url, '_blank');
  };

  // Center map when mapCenter changes
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.panTo(mapCenter);
    }
  }, [mapCenter]);

  // Close InfoWindow on day change
  useEffect(() => {
    setSelectedMarker(null);
  }, [selectedDay]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Trip to {tripData.destination}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {format(new Date(tripData.startDate), 'MMM d, yyyy')} - {format(new Date(tripData.endDate), 'MMM d, yyyy')}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip icon={<AccessTime />} label={`${tripData.itinerary.length} Days`} />
          <Chip icon={<LocationOn />} label={tripData.destination} />
          <Chip label={`Budget: $${tripData.budget}`} />
        </Stack>
      </Box>

      {/* Timeline/Map View Toggle Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
          startIcon={<Timeline />}
          onClick={() => setViewMode('timeline')}
        >
          Timeline View
        </Button>
        <Button
          variant={viewMode === 'map' ? 'contained' : 'outlined'}
          startIcon={<Map />}
          onClick={() => setViewMode('map')}
        >
          Map View
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Day Navigation */}
        {tripData.itinerary.length > 1 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconButton 
                onClick={() => handleDayChange(Math.max(0, selectedDay - 1))}
                disabled={selectedDay === 0 || isDayTransitioning}
              >
                <NavigateBefore />
              </IconButton>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">
                  Day {tripData.itinerary[selectedDay].day}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {format(new Date(tripData.itinerary[selectedDay].date), 'MMMM d, yyyy')}
                </Typography>
              </Box>

              <IconButton 
                onClick={() => handleDayChange(Math.min(tripData.itinerary.length - 1, selectedDay + 1))}
                disabled={selectedDay === tripData.itinerary.length - 1 || isDayTransitioning}
              >
                <NavigateNext />
              </IconButton>
            </Paper>
          </Grid>
        )}

        {/* Timeline/Map View */}
        <Grid item xs={12}>
          <Fade in={!isDayTransitioning} timeout={300}>
            <div>
              {viewMode === 'timeline' ? (
                <Paper sx={{ p: 3 }}>
                  {/* Weather Forecast */}
                  {tripData.itinerary[selectedDay].weather && (
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {tripData.itinerary[selectedDay].weather?.icon}
                      <Typography>
                        {tripData.itinerary[selectedDay].weather?.temperature}°C - {tripData.itinerary[selectedDay].weather?.condition}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 3 }}>
                    {filteredActivities.length > 0 ? (
                      <>
                        <div>
                          <Box sx={{ width: '100%', mb: 2 }}>
                            <Stepper
                              activeStep={selectedActivityIndex}
                              orientation="vertical"
                              sx={{
                                '& .MuiStepLabel-label': {
                                  fontSize: '0.875rem',
                                },
                                '& .MuiStepLabel-iconContainer': {
                                  paddingRight: 2,
                                  '& .MuiStepIcon-root': {
                                    '&.Mui-active': {
                                    },
                                    '&.Mui-completed': {
                                    },
                                  },
                                },
                                '& .MuiStepContent-root': {
                                },
                              }}
                            >
                              {filteredActivities.map((activity, index) => (
                                <Step key={activity.id}>
                                  <StepLabel
                                    onClick={() => {
                                      setSelectedActivityIndex(index);
                                    }}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': {
                                        '& .MuiStepLabel-label': {
                                        }
                                      }
                                    }}
                                  >
                                    <Box sx={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      alignItems: 'flex-start',
                                      transition: 'all 0.2s ease-in-out'
                                    }}>
                                      <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                          fontWeight: selectedActivityIndex === index ? 400 : 300
                                        }}
                                      >
                                        {activity.time} - {activity.name}
                                      </Typography>
                                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip
                                          icon={getActivityIcon(activity.type)}
                                          label={activity.type}
                                          size="small"
                                          sx={{ 
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            '& .MuiChip-icon': { color: 'inherit' }
                                          }}
                                        />
                                      </Stack>
                                    </Box>
                                  </StepLabel>
                                  <StepContent>
                                    <Box>
                                      <Card 
                                        sx={{ 
                                          mt: 1,
                                          boxShadow: 3,
                                          borderRadius: 2,
                                          overflow: 'hidden',
                                          transition: 'all 0.3s ease-in-out',
                                          '&:hover': {
                                            boxShadow: 6,
                                            transform: 'translateY(-2px)'
                                          }
                                        }}
                                      >
                                        <CardContent>
                                          <Grid container spacing={2}>
                                            <Grid item xs={12} sm={8}>
                                              <Typography 
                                                variant="body1" 
                                                color="text.secondary" 
                                                paragraph
                                                sx={{ 
                                                  lineHeight: 1.6,
                                                  mb: 2
                                                }}
                                              >
                                                {activity.description}
                                              </Typography>
                                            </Grid>
                                            {activity.image && (
                                              <Grid item xs={12} sm={4}>
                                                <Box
                                                  component="img"
                                                  src={activity.image}
                                                  alt={activity.name}
                                                  sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    objectFit: 'cover',
                                                    borderRadius: 1,
                                                    boxShadow: 2
                                                  }}
                                                />
                                              </Grid>
                                            )}
                                          </Grid>
                                        </CardContent>
                                        <CardActions sx={{ 
                                          p: 2, 
                                          pt: 0,
                                          justifyContent: 'space-between',
                                          gap: 1
                                        }}>
                                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-start', flexGrow: 1 }}>
                                            <Chip
                                              icon={<AccessTime />}
                                              label={activity.duration}
                                              size="small"
                                              variant="outlined"
                                            />
                                            <Chip
                                              icon={<AttachMoney />}
                                              label={`$${activity.cost}`}
                                              size="small"
                                              variant="outlined"
                                            />
                                            <Chip
                                              label={`${activity.rating}★`}
                                              size="small"
                                              color="primary"
                                            />
                                          </Stack>
                                          <Stack direction="row" spacing={1}>
                                            <Button 
                                              variant="outlined" 
                                              size="small" 
                                              startIcon={<Map />} 
                                              onClick={() => handleViewOnMap(activity)}
                                            >
                                              View on Map
                                            </Button>
                                            <Button
                                              variant="contained"
                                              size="small" 
                                              startIcon={<DirectionsWalk />} 
                                              onClick={() => handleGetDirections(activity)}
                                            >
                                              Get Directions
                                            </Button>
                                          </Stack>
                                        </CardActions>
                                      </Card>
                                      <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'flex-end', 
                                        alignItems: 'center', 
                                        mt: 2,
                                        mb: 1,
                                        gap: 1
                                      }}>
                                        {selectedActivityIndex > 0 && (
                                          <Button
                                            variant="outlined"
                                            startIcon={<KeyboardArrowUp />}
                                            onClick={handlePreviousActivity}
                                            size="small"
                                            sx={{ 
                                              borderRadius: 1,
                                              textTransform: 'none',
                                              px: 2,
                                              minWidth: 'auto',
                                              '& .MuiButton-startIcon': {
                                                marginRight: 0.5
                                              }
                                            }}
                                          >
                                            Previous
                                          </Button>
                                        )}
                                        {(!isLastActivityOfTrip) && (
                                          selectedActivityIndex < filteredActivities.length - 1 && (
                                            <Button
                                              variant="contained"
                                              endIcon={<KeyboardArrowDown />}
                                              onClick={handleNextActivity}
                                              size="small"
                                              sx={{ 
                                                borderRadius: 1,
                                                textTransform: 'none',
                                                px: 2,
                                                minWidth: 'auto',
                                                '& .MuiButton-endIcon': {
                                                  marginLeft: 0.5
                                                }
                                              }}
                                            >
                                              Next
                                            </Button>
                                          )
                                        )}
                                        {isLastActivityOfTrip && (
                                          <Button
                                            variant="contained"
                                            onClick={handleNextActivity}
                                            size="small"
                                            sx={{ 
                                              borderRadius: 1,
                                              textTransform: 'none',
                                              px: 2,
                                              minWidth: 'auto',
                                              bgcolor: 'success.main',
                                              '&:hover': {
                                                bgcolor: 'success.dark',
                                              }
                                            }}
                                          >
                                            Complete Trip
                                          </Button>
                                        )}
                                      </Box>
                                    </Box>
                                  </StepContent>
                                </Step>
                              ))}
                            </Stepper>
                          </Box>
                        </div>
                      </>
                    ) : (
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Activities Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          There are no activities scheduled for this day.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">
                      Map View
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        icon={<Attractions />}
                        label="Attractions"
                        size="small"
                        sx={{ bgcolor: '#FF5252', color: 'white' }}
                      />
                      <Chip
                        icon={<Restaurant />}
                        label="Restaurants"
                        size="small"
                        sx={{ bgcolor: '#4CAF50', color: 'white' }}
                      />
                      <Chip
                        icon={<Hotel />}
                        label="Hotels"
                        size="small"
                        sx={{ bgcolor: '#2196F3', color: 'white' }}
                      />
                    </Box>
                  </Box>
                  {isLoaded ? (
                    <Box sx={{ 
                      height: 500,
                      width: '100%',
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={mapCenter || center()}
                        zoom={13}
                        onClick={onMapClick}
                        options={mapOptions}
                        onLoad={map => { mapRef.current = map; }}
                      >
                        <Polyline
                          path={routePath}
                          options={{
                            strokeColor: '#2196F3',
                            strokeOpacity: 0.5,
                            strokeWeight: 3,
                            icons: [{
                              icon: {
                                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                                scale: 3
                              },
                              offset: '50%'
                            }]
                          }}
                        />
                        {filteredActivities.map((activity, index) => (
                          <Marker
                            key={activity.id}
                            position={{
                              lat: activity.location[0],
                              lng: activity.location[1]
                            }}
                            onClick={() => onMarkerClick(activity)}
                            label={{
                              text: `${index + 1}`,
                              color: '#ffffff',
                              fontWeight: 'bold'
                            }}
                          />
                        ))}
                        {selectedMarker && (
                          <InfoWindow
                            position={{
                              lat: selectedMarker.location[0],
                              lng: selectedMarker.location[1]
                            }}
                            onCloseClick={() => setSelectedMarker(null)}
                            options={{
                              disableAutoPan: true,
                              headerDisabled: true,
                              pixelOffset: new google.maps.Size(0, -40)
                            }}
                          >
                            <Fade in={Boolean(selectedMarker)} timeout={400}>
                              <Box sx={{ maxWidth: 300, p: 0 }}>
                                {/* Header with title only (no custom close button) */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="subtitle1" gutterBottom sx={{ mb: 0 }}>
                                    {selectedMarker.name}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => setSelectedMarker(null)}
                                    sx={{ ml: 1, color: 'grey.600', '&:hover': { color: 'error.main' } }}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Typography variant="body2">
                                  {selectedMarker.time} - {selectedMarker.duration}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {selectedMarker.description}
                                </Typography>
                                {/* Chips and Go button in the same row */}
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                      icon={<AccessTime />}
                                      label={selectedMarker.duration}
                                      size="small"
                                    />
                                    <Chip
                                      icon={<AttachMoney />}
                                      label={`$${selectedMarker.cost}`}
                                      size="small"
                                    />
                                    <Chip
                                      label={`${selectedMarker.rating}★`}
                                      size="small"
                                      color="primary"
                                    />
                                  </Box>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    endIcon={<NavigationIcon />}
                                    onClick={() => handleGetDirections(selectedMarker)}
                                  >
                                    Go
                                  </Button>
                                </Box>
                              </Box>
                            </Fade>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                      }}
                    >
                      <Typography color="text.secondary">
                        Loading map...
                      </Typography>
                    </Box>
                  )}
                  {viewMode === 'map' && filteredActivities.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
                      <Button
                        startIcon={<NavigateBefore />}
                        onClick={() => {
                          setSelectedActivityIndex(prev => {
                            const newIndex = Math.max(0, prev - 1);
                            setSelectedMarker(filteredActivities[newIndex]);
                            setMapCenter({ lat: filteredActivities[newIndex].location[0], lng: filteredActivities[newIndex].location[1] });
                            return newIndex;
                          });
                        }}
                        disabled={selectedActivityIndex === 0 || isDayTransitioning}
                      >
                        Previous Activity
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        Activity {selectedActivityIndex + 1} of {filteredActivities.length}
                      </Typography>
                      <Button
                        endIcon={<NavigateNext />}
                        onClick={() => {
                          setSelectedActivityIndex(prev => {
                            const newIndex = Math.min(filteredActivities.length - 1, prev + 1);
                            setSelectedMarker(filteredActivities[newIndex]);
                            setMapCenter({ lat: filteredActivities[newIndex].location[0], lng: filteredActivities[newIndex].location[1] });
                            return newIndex;
                          });
                        }}
                        disabled={selectedActivityIndex === filteredActivities.length - 1 || isDayTransitioning}
                      >
                        Next Activity
                      </Button>
                    </Box>
                  )}
                </Paper>
              )}
            </div>
          </Fade>
        </Grid>
      </Grid>

      {/* Day Selector - Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Day
            </Typography>
            <List>
              {tripData.itinerary.map((day, index) => (
                <ListItem key={day.day} disablePadding>
                  <ListItemButton
                    selected={selectedDay === index}
                    onClick={() => {
                      handleDayChange(index);
                      setDrawerOpen(false);
                    }}
                  >
                    <ListItemText
                      primary={`Day ${day.day}`}
                      secondary={format(new Date(day.date), 'MMM d, yyyy')}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}
    </Container>
  );
};

export default Itinerary; 