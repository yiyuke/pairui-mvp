import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-6">Welcome to PairUI</h1>
        <p className="text-xl text-gray-700 mb-8">
          Connect designers and developers for collaborative projects
        </p>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg">Welcome back, {user.username}!</p>
            <div className="flex justify-center space-x-4">
              {user.role === 'designer' ? (
                <Link
                  to="/designer/dashboard"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Go to Designer Dashboard
                </Link>
              ) : user.role === 'developer' ? (
                <Link
                  to="/developer/dashboard"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Go to Developer Dashboard
                </Link>
              ) : (
                <Link
                  to="/choose-role"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Choose Your Role
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 