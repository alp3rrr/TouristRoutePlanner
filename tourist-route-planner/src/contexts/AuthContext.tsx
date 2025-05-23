import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber: string;
  dateOfBirth: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileResponse = await authApi.getProfile();
        setUser(profileResponse.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login({ username, password });
      const { jwtToken, refreshToken, user } = response.data;
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Invalid username or password');
      } else if (err.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const userId = localStorage.getItem('userId');
      
      if (refreshToken && userId) {
        await authApi.logout({ refreshToken, userId });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (data: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.register(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 