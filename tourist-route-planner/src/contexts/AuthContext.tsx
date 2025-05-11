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

    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
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
      const { jwtToken } = response.data;
      localStorage.setItem('token', jwtToken);
      
      // Fetch user profile after successful login
      const profileResponse = await authApi.getProfile();
      setUser(profileResponse.data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed, username or password is incorrect.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
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