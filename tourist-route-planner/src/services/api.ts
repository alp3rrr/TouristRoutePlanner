import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://app-touristrouteplanner-dev-gwbsfgb7abdfb9ex.germanywestcentral-01.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error) => {
    const originalRequest = error.config;
    console.log("Error in interceptor:", {
      status: error.response?.status,
      message: error.message,
      response: error.response,
      request: originalRequest
    });

    // If there's no response or it's not a 401, or the request has already been retried
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we're already refreshing the token, queue the request
    if (isRefreshing) {
      console.log("Token refresh in progress, queueing request");
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          console.log("Retrying queued request with new token");
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;
    console.log("Starting token refresh process");

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const userId = localStorage.getItem('userId');

      if (!refreshToken || !userId) {
        console.error("Missing refresh token or user ID");
        throw new Error('No refresh token or user ID found');
      }

      console.log("Attempting to refresh token");
      const response = await api.post('/api/Auth/RefreshToken', {
        refreshToken,
        userId
      });

      const { jwtToken, refreshToken: newRefreshToken } = response.data;
      console.log("Token refresh successful");
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Update the authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      originalRequest.headers.Authorization = `Bearer ${jwtToken}`;

      processQueue(null, jwtToken);
      return api(originalRequest);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      processQueue(refreshError, null);
      // If refresh token fails, logout the user
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
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
  
  logout: (data: { refreshToken: string; userId: string }) =>
    api.post('/api/Auth/Logout', data),
  
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