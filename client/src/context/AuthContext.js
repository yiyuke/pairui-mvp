import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { retryRequest } from '../utils/axiosConfig';

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
          const res = await retryRequest({
            method: 'get',
            url: 'http://localhost:5001/api/users/current',
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
      const res = await retryRequest({
        method: 'post',
        url: 'http://localhost:5001/api/users/register',
        data: { username, email, password }
      });
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
      const res = await retryRequest({
        method: 'post',
        url: 'http://localhost:5001/api/users/login',
        data: formData
      });
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return user; // Return the user object for redirect logic
    } catch (err) {
      // Add more specific error message handling
      if (err.response) {
        // If the error has a response, check status
        if (err.response.status === 400) {
          // Check for specific error messages from backend
          if (err.response.data.msg === 'Invalid credentials') {
            err.response.data.msg = 'Email and password do not match';
          } else if (err.response.data.msg && err.response.data.msg.includes('User')) {
            err.response.data.msg = 'Email not registered. Please create an account.';
          }
        }
      } else if (err.request) {
        // Network error
        err.response = { data: { msg: 'Network error. Please try again later.' } };
      } else {
        // Something else happened
        err.response = { data: { msg: 'Login failed. Please try again.' } };
      }
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
      const res = await retryRequest({
        method: 'put',
        url: 'http://localhost:5001/api/users/role',
        data: { role },
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Error setting role:', err);
      throw err;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!localStorage.token) {
      return;
    }
    
    try {
      const res = await retryRequest({
        method: 'get',
        url: 'http://localhost:5001/api/users/current',
        headers: {
          'x-auth-token': localStorage.token
        }
      });
      setUser(res.data);
      setIsAuthenticated(true);
      return res.data;
    } catch (err) {
      console.error('Error refreshing user:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  // Load user data
  const loadUser = async () => {
    if (!localStorage.token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await retryRequest({
        method: 'get',
        url: 'http://localhost:5001/api/users/current',
        headers: {
          'x-auth-token': localStorage.token
        }
      });
      setUser(res.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
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