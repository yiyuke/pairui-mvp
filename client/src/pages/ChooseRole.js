import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ChooseRole = () => {
  const { setRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRoleSelection = async (role) => {
    try {
      await setRole(role);
      if (role === 'developer') {
        navigate('/developer/dashboard');
      } else {
        navigate('/designer/dashboard');
      }
    } catch (err) {
      console.error('Error setting role:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Choose Your Role</h1>
          <p className="mt-2 text-gray-600">Select how you want to use PairUI</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => handleRoleSelection('developer')}
            className="flex flex-col items-center justify-center p-6 space-y-4 text-center border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Developer</h3>
              <p className="text-sm text-gray-500">Create missions and get UI designs</p>
            </div>
          </button>
          
          <button
            onClick={() => handleRoleSelection('designer')}
            className="flex flex-col items-center justify-center p-6 space-y-4 text-center border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Designer</h3>
              <p className="text-sm text-gray-500">Apply for missions and create UI designs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseRole; 