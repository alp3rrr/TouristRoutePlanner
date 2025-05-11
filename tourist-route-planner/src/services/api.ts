import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7077',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("we at 401");
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => api.post('/api/Auth/Register', data),
  
  login: (data: { username: string; password: string }) => 
    api.post('/api/Auth/Login', data),
  
  forgotPassword: (email: string) => 
    api.post('/api/Auth/ForgotPassword', { email }),
  
  resetPassword: (data: { email: string; token: string; newPassword: string }) => 
    api.post('/api/Auth/ResetPassword', data),
  
  confirmEmail: (data: { email: string; token: string }) => 
    api.post('/api/Auth/ConfirmEmail', data),

  getProfile: () => api.get('/api/Auth/Profile'),

  updateProfile: (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber?: string;
  }) => api.put('/api/Auth/Profile', data),
};

export const placesApi = {
  getPlaces: () => api.get('/api/Places'),
  getPlace: (id: string) => api.get(`/api/Places/${id}`),
  addPlace: (data: {
    externalId: string;
    displayName: string;
    languageCode: string;
    city: string;
    rating: number;
    priceLevel?: string;
    latitude: number;
    longitude: number;
    types: string[];
  }) => api.post('/api/Places', data),
  updatePlace: (id: string, data: {
    displayName: string;
    languageCode: string;
    city: string;
    rating: number;
    priceLevel?: string;
    latitude: number;
    longitude: number;
    types: string[];
  }) => api.put(`/api/Places/${id}`, data),
  deletePlace: (id: string) => api.delete(`/api/Places/${id}`),
};

export const travelsApi = {
  getTravels: () => api.get('/api/Travels'),
  getTravel: (id: string) => api.get(`/api/Travels/${id}`),
  addTravel: (data: {
    startDate: string;
    endDate: string;
    city: string;
    title: string;
    travelerType: number;
    typeIds: string[];
    placeIds: string[];
  }) => api.post('/api/Travels', data),
  updateTravel: (id: string, data: {
    startDate: string;
    endDate: string;
    city: string;
    title: string;
    travelerType: number;
    typeIds: string[];
    placeIds: string[];
  }) => api.put(`/api/Travels/${id}`, data),
  deleteTravel: (id: string) => api.delete(`/api/Travels/${id}`),
};

export const distanceApi = {
  getDistances: () => api.get('/api/Distance'),
  getDistance: (id: string) => api.get(`/api/Distance/${id}`),
  addDistance: (data: {
    originPlaceExternalId: string;
    destinationPlaceExternalId: string;
    walkingDistance: string;
    walkingDuration: string;
    drivingDistance: string;
    drivingDuration: string;
  }) => api.post('/api/Distance', data),
  updateDistance: (id: string, data: {
    walkingDistance: string;
    walkingDuration: string;
    drivingDistance: string;
    drivingDuration: string;
  }) => api.put(`/api/Distance/${id}`, data),
  deleteDistance: (id: string) => api.delete(`/api/Distance/${id}`),
  getDistanceByPlaces: (originId: string, destinationId: string) => 
    api.get(`/api/Distance/origin/${originId}/destination/${destinationId}`),
  getDistancesByPlace: (placeId: string) => 
    api.get(`/api/Distance/place/${placeId}`),
};

export const typesApi = {
  getTypes: () => api.get('/api/Types'),
  getType: (id: string) => api.get(`/api/Types/${id}`),
  addType: (data: { name: string }) => api.post('/api/Types', data),
  updateType: (id: string, data: { name: string }) => 
    api.put(`/api/Types/${id}`, data),
  deleteType: (id: string) => api.delete(`/api/Types/${id}`),
};

export default api; 