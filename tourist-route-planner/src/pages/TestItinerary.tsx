import React from 'react';
import Itinerary from './Itinerary';
import { WbSunny, Cloud } from '@mui/icons-material';

const sampleTripData = {
  destination: 'Paris, France',
  startDate: '2024-04-01',
  endDate: '2024-04-05',
  budget: 2000,
  interests: ['Culture', 'Food', 'Art'],
  itinerary: [
    {
      day: 1,
      date: '2024-04-01',
      weather: {
        date: '2024-04-01',
        temperature: 22,
        condition: 'Sunny',
        icon: <WbSunny />
      },
      activities: [
        {
          id: '1',
          time: '09:00',
          name: 'Eiffel Tower Visit',
          type: 'attraction',
          duration: '2 hours',
          location: [48.8584, 2.2945] as [number, number],
          description: 'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris.',
          cost: 30,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        },
        {
          id: '2',
          time: '12:00',
          name: 'Lunch at Le Marais',
          type: 'restaurant',
          duration: '1.5 hours',
          location: [48.8566, 2.3522] as [number, number],
          description: 'Enjoy traditional French cuisine in the historic Le Marais district.',
          cost: 45,
          rating: 4.5
        },
        {
          id: '3',
          time: '14:00',
          name: 'Louvre Museum',
          type: 'attraction',
          duration: '3 hours',
          location: [48.8606, 2.3376] as [number, number],
          description: 'Explore the world\'s largest art museum and home to the Mona Lisa.',
          cost: 17,
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        }
      ],
      transportation: [
        {
          type: 'walking',
          duration: '15 min',
          cost: 0,
          distance: '1.2 km'
        },
        {
          type: 'metro',
          duration: '8 min',
          cost: 2,
          distance: '1.2 km'
        },
        {
          type: 'taxi',
          duration: '5 min',
          cost: 12,
          distance: '1.2 km'
        }
      ]
    },
    {
      day: 2,
      date: '2024-04-02',
      weather: {
        date: '2024-04-02',
        temperature: 19,
        condition: 'Cloudy',
        icon: <Cloud />
      },
      activities: [
        {
          id: '4',
          time: '10:00',
          name: 'Notre-Dame Cathedral',
          type: 'attraction',
          duration: '1.5 hours',
          location: [48.8530, 2.3499] as [number, number],
          description: 'Visit the famous Gothic cathedral and its stunning architecture.',
          cost: 0,
          rating: 4.6
        },
        {
          id: '5',
          time: '12:30',
          name: 'Seine River Cruise',
          type: 'attraction',
          duration: '1 hour',
          location: [48.8566, 2.3522] as [number, number],
          description: 'Enjoy a scenic boat tour along the Seine River.',
          cost: 15,
          rating: 4.4
        }
      ],
      transportation: [
        {
          type: 'walking',
          duration: '20 min',
          cost: 0,
          distance: '1.5 km'
        },
        {
          type: 'bus',
          duration: '10 min',
          cost: 2,
          distance: '1.5 km'
        },
        {
          type: 'bike',
          duration: '8 min',
          cost: 5,
          distance: '1.5 km'
        }
      ]
    }
  ]
};

const TestItinerary: React.FC = () => {
  return <Itinerary tripData={sampleTripData} />;
};

export default TestItinerary; 