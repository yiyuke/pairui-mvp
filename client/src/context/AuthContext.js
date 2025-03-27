import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        try {
          const token = localStorage.getItem('token');
          
          // Set auth token header
          setAuthToken(token);
          
          // Get user data
          const res = await axios.get('http://localhost:5001/api/users/me');
          
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          setError('Session expired. Please log in again.');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Set auth token header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5001/api/users', formData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      const userRes = await axios.get('http://localhost:5001/api/users/me');
      setUser(userRes.data);
      setIsAuthenticated(true);
      setError(null);
      
      return true;
    } catch (err) {
      setError(err.response.data.msg || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5001/api/users/login', formData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      const userRes = await axios.get('http://localhost:5001/api/users/me');
      setUser(userRes.data);
      setIsAuthenticated(true);
      setError(null);
      
      return true;
    } catch (err) {
      setError(err.response.data.msg || 'Login failed');
      return false;
    }
  };

  // Set user role
  const setRole = async (role) => {
    try {
      const res = await axios.put('http://localhost:5001/api/users/role', { role });
      setUser(res.data);
      return true;
    } catch (err) {
      setError(err.response.data.msg || 'Failed to set role');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        setRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 