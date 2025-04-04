import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MissionList from '../components/MissionList';
import axios from 'axios';

const DeveloperDashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/missions', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        // Filter missions created by this developer
        const developerMissions = res.data.filter(
          mission => mission.developerId === user._id
        );
        setMissions(developerMissions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch missions');
        setLoading(false);
      }
    };
    
    fetchMissions();
  }, [user._id]);

  useEffect(() => {
    refreshUser();
  }, []);

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
          
          <MissionList 
            missions={missions}
            loading={loading}
            error={error}
            emptyMessage="You haven't created any missions yet."
            userRole="developer"
          />
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;