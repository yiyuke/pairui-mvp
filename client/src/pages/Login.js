import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLoginError(''); // Clear error when user types
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!email || !password) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await login(formData);
      
      if (user) {
        // Check if user already has a role
        if (user.role) {
          // Go directly to the appropriate dashboard
          navigate(`/${user.role}/dashboard`);
        } else {
          // If no role is set, go to choose-role page
          navigate('/choose-role');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Invalid credentials';
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Sign In</h1>
          <p className="mt-2 text-gray-600">Access your PairUI account</p>
        </div>
        
        {loginError && (
          <div className="text-center text-red-600 text-sm mb-1">
            {loginError}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={onChange}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={onChange}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 