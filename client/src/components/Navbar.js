import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import defaultDeveloperAvatar from '../assets/images/default-developer-avatar.png';
import defaultDesignerAvatar from '../assets/images/default-designer-avatar.png';
import NotificationIcon from './NotificationIcon';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDefaultAvatar = (role) => {
    if (role === 'developer') {
      return defaultDeveloperAvatar;
    } else if (role === 'designer') {
      return defaultDesignerAvatar;
    }
    return 'https://via.placeholder.com/150';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-indigo-600">PairUI</Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role && (
                  <Link 
                    to={`/${user.role}/dashboard`} 
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    Dashboard
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <NotificationIcon />
                  
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      className="flex items-center focus:outline-none"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <img 
                        src={user.profile?.avatar || getDefaultAvatar(user.role)} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="ml-2">{user.username}</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <Link 
                          to={`/profile/${user._id}`} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <div 
                          onClick={handleLogout} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          Logout
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 