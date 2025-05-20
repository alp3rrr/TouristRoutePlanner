import React from 'react';
import TripPlans from '../components/TripPlans';

const Recommendations: React.FC = () => {
  // Sample data for testing
  const samplePlans = [
    {
      attractions: [
        {
          id: 1,
          name: "Eiffel Tower",
          score: 9.5,
          budget: 30,
          time: 120,
          location: [48.8584, 2.2945] as [number, number],
          category: "Landmark"
        },
        {
          id: 2,
          name: "Louvre Museum",
          score: 9.2,
          budget: 20,
          time: 180,
          location: [48.8606, 2.3376] as [number, number],
          category: "Museum"
        },
        {
          id: 3,
          name: "Notre-Dame Cathedral",
          score: 8.8,
          budget: 0,
          time: 90,
          location: [48.8530, 2.3499] as [number, number],
          category: "Historical"
        },
        {
          id: 4,
          name: "Arc de Triomphe",
          score: 8.5,
          budget: 15,
          time: 60,
          location: [48.8738, 2.2950] as [number, number],
          category: "Landmark"
        }
      ],
      score: 9.0,
      budget: 65,
      time: 450,
      fitness: 0.85,
      violations: 0
    },
    {
      attractions: [
        {
          id: 5,
          name: "Montmartre",
          score: 8.9,
          budget: 10,
          time: 150,
          location: [48.8867, 2.3431] as [number, number],
          category: "Cultural"
        },
        {
          id: 6,
          name: "Sacre-Coeur",
          score: 8.7,
          budget: 0,
          time: 90,
          location: [48.8867, 2.3431] as [number, number],
          category: "Religious"
        },
        {
          id: 7,
          name: "Moulin Rouge",
          score: 8.4,
          budget: 100,
          time: 180,
          location: [48.8841, 2.3324] as [number, number],
          category: "Entertainment"
        }
      ],
      score: 8.7,
      budget: 110,
      time: 420,
      fitness: 0.92,
      violations: 0
    },
    {
      attractions: [
        {
          id: 8,
          name: "Seine River Cruise",
          score: 8.6,
          budget: 25,
          time: 60,
          location: [48.8566, 2.3522] as [number, number],
          category: "Tour"
        },
        {
          id: 9,
          name: "Champs-Elysees",
          score: 8.3,
          budget: 50,
          time: 120,
          location: [48.8698, 2.3079] as [number, number],
          category: "Shopping"
        },
        {
          id: 10,
          name: "Palace of Versailles",
          score: 9.1,
          budget: 20,
          time: 240,
          location: [48.8044, 2.1232] as [number, number],
          category: "Historical"
        }
      ],
      score: 8.7,
      budget: 95,
      time: 420,
      fitness: 0.95,
      violations: 1
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Recommended Trip Plans</h1>
      <TripPlans plans={samplePlans} />
    </div>
  );
};

export default Recommendations; 