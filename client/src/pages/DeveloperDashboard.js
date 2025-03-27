import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DeveloperDashboard = () => {
  const { user } = useContext(AuthContext);
  const [missions, setMissions] = useState([]);
  
  // You can add code to fetch missions here

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}</h2>
          <p className="text-gray-600 mb-4">
            This is your developer dashboard where you can create and manage your missions.
          </p>
          
          <Link 
            to="/missions/create" 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Create New Mission
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Missions</h2>
          
          {missions.length === 0 ? (
            <p className="text-gray-600">You haven't created any missions yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Map through missions here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;