import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, Paper, CircularProgress, Alert, List, ListItem, ListItemIcon, ListItemText, Divider, Grid } from '@mui/material';
import { Place, ArrowForward } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

interface Activity {
  time: string;
  name: string;
  type: string;
  duration: string;
}

interface Day {
  day: number;
  date: string;
  activities: Activity[];
}

interface TripData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  interests: string[];
  itinerary: Day[];
}

const libraries: ("places")[] = ['places'];

const MapView: React.FC = () => {
  const location = useLocation();
  const tripData = location.state?.tripData as TripData | undefined;
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<Array<{ position: google.maps.LatLngLiteral; label: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
    version: 'weekly'
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setLoading(false);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!tripData || !map) return;

    const geocoder = new google.maps.Geocoder();
    const activities = tripData.itinerary.flatMap(day => day.activities);

    // Geocode all activities
    Promise.all(activities.map((activity, index) => 
      new Promise<{ position: google.maps.LatLngLiteral; label: string }>((resolve, reject) => {
        geocoder.geocode({ 
          address: `${activity.name}, ${tripData.destination}`
        }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            // Ensure we're using numeric labels (index + 1)
            resolve({
              position: { lat: location.lat(), lng: location.lng() },
              label: `${index + 1}. ${activity.name}`
            });
          } else {
            reject(new Error(`Could not geocode ${activity.name}`));
          }
        });
      })
    )).then(locations => {
      // Sort locations by their numeric label to ensure consistent ordering
      const sortedLocations = [...locations].sort((a, b) => {
        const aNum = parseInt(a.label.split('.')[0]);
        const bNum = parseInt(b.label.split('.')[0]);
        return aNum - bNum;
      });
      
      setMarkers(sortedLocations);
      
      if (sortedLocations.length >= 2) {
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route({
          origin: sortedLocations[0].position,
          destination: sortedLocations[sortedLocations.length - 1].position,
          waypoints: sortedLocations.slice(1, -1).map(loc => ({
            location: loc.position,
            stopover: true
          })),
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.WALKING,
        }, (result, status) => {
          if (status === 'OK' && result) {
            setDirections(result);
            setError(null);
            
            // Center the map to show all markers
            const bounds = new google.maps.LatLngBounds();
            sortedLocations.forEach(loc => bounds.extend(loc.position));
            map.fitBounds(bounds);
          } else {
            setError('Could not calculate route. Please check if all locations are valid.');
            console.error('Directions request failed:', status);
          }
        });
      }
    }).catch(error => {
      setError('Could not find one or more locations. Please check the addresses.');
      console.error('Geocoding failed:', error);
    });
  }, [tripData, map]);

  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading Google Maps. Please check your API key.</Alert>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {!isLoaded ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'row-reverse', gap: 3 }}>
          <Box sx={{ flex: '3 1 auto', minWidth: 0 }}>
            <Paper elevation={3} sx={{ height: '80vh', position: 'relative' }}>
              {/* Map container */}
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                zoom={13}
                center={{ lat: 41.0082, lng: 28.9784 }} // Default to Istanbul
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {directions && (
                  <DirectionsRenderer 
                    directions={directions}
                    options={{
                      suppressMarkers: true, // This hides the default A, B, C markers
                      polylineOptions: {
                        strokeColor: '#2196F3', // Material-UI primary blue
                        strokeWeight: 5,
                      }
                    }}
                  />
                )}
                {markers.map((marker, index) => (
                  <Marker
                    key={index}
                    position={marker.position}
                    label={{
                      text: `${index + 1}`,
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}
                    onClick={() => setSelectedMarker(index)}
                  >
                    {selectedMarker === index && (
                      <InfoWindow
                        position={marker.position}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div>
                          <Typography variant="subtitle2">
                            {`${index + 1}. ${marker.label.split('. ')[1]}`}
                          </Typography>
                          <Typography variant="body2">
                            {tripData?.itinerary.flatMap(day => 
                              day.activities
                            )[index]?.time}
                          </Typography>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                ))}
              </GoogleMap>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
            {/* Route details panel */}
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Trip Route
              </Typography>
              {tripData && (
                <>
                  <Typography variant="body1" gutterBottom>
                    Planning route for: {tripData.destination}
                  </Typography>
                  <List>
                    {markers.map((marker, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <Place />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${index + 1}. ${marker.label.split('. ')[1]}`}
                            secondary={tripData.itinerary.flatMap(day => 
                              day.activities
                            )[index]?.time}
                          />
                        </ListItem>
                        {index < markers.length - 1 && (
                          <ListItem>
                            <ListItemIcon>
                              <ArrowForward />
                            </ListItemIcon>
                            <ListItemText secondary="Walking" />
                          </ListItem>
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </>
              )}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MapView; 