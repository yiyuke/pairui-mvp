import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">PairUI</Link>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="hidden md:inline">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-indigo-100 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 