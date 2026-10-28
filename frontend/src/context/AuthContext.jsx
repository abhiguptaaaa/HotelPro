import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data.user);
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: receivedToken, user: loggedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      return { success: true, user: loggedUser };
    } catch (err) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
      return { success: false, message: err.message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      const { token: receivedToken, user: registeredUser } = res.data;

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(registeredUser);
      toast.success(`Account registered successfully! Welcome to HotelPro.`);
      return { success: true, user: registeredUser };
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      return { success: false, message: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('You have logged out successfully.');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await API.put('/auth/profile', profileData);
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }
      toast.success('Profile updated successfully!');
      return { success: true, user: res.data.user };
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
