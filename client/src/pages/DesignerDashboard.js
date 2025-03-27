// client/src/pages/DesignerDashboard.js
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DesignerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [availableMissions, setAvailableMissions] = useState([]);
  
  // You can add code to fetch available missions here

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Designer Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}</h2>
          <p className="text-gray-600 mb-4">
            This is your designer dashboard where you can browse and apply for missions.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Missions</h2>
          
          {availableMissions.length === 0 ? (
            <p className="text-gray-600">There are no available missions at the moment.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Map through available missions here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;