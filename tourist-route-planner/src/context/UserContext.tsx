import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  preferences: UserPreferences;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement user data fetching from backend
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Mock user data - replace with actual API call
        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          bio: 'Travel enthusiast and adventure seeker',
          preferences: {
            notifications: true,
            darkMode: false,
          },
        };
        setUser(mockUser);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      // TODO: Implement API call to update user data
      if (user) {
        setUser({ ...user, ...userData });
      }
    } catch (err) {
      setError('Failed to update user data');
      console.error('Error updating user data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      // TODO: Implement API call to update preferences
      if (user) {
        setUser({
          ...user,
          preferences: { ...user.preferences, ...preferences },
        });
      }
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // TODO: Implement logout logic
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        updateUser,
        updatePreferences,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 