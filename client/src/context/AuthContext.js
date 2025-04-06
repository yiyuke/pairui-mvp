import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        try {
          const res = await axios.get('http://localhost:5001/api/users/current', {
            headers: {
              'x-auth-token': localStorage.token
            }
          });
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (username, email, password) => {
    try {
      const res = await axios.post('http://localhost:5001/api/users/register', { username, email, password });
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      throw err.response.data;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5001/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return user; // Return the user object for redirect logic
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Set user role
  const setRole = async (role) => {
    try {
      const res = await axios.put(
        'http://localhost:5001/api/users/role',
        { role },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setUser(res.data);
      return true;
    } catch (err) {
      throw err.response.data;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!localStorage.token) {
      console.error('No token found when trying to refresh user');
      return false;
    }
    
    try {
      const res = await axios.get('http://localhost:5001/api/users/current', {
        headers: {
          'x-auth-token': localStorage.token
        }
      });
      setUser(res.data);
      return true;
    } catch (err) {
      console.error('Error refreshing user:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      return false;
    }
  };

  // Load user function to be used externally
  const loadUser = async () => {
    if (localStorage.token) {
      try {
        const res = await axios.get('http://localhost:5001/api/users/current', {
          headers: {
            'x-auth-token': localStorage.token
          }
        });
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
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
        logout,
        setRole,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 