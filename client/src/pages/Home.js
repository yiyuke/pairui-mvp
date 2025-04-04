import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      if (user.role) {
        navigate(`/${user.role}/dashboard`);
      } else {
        navigate('/choose-role');
      }
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Redirecting...</div>
    </div>
  );
};

export default Home; 