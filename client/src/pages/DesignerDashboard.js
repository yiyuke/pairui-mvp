// client/src/pages/DesignerDashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import MissionSearch from '../components/MissionSearch';

const DesignerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ searchTerm: '', uiLibrary: '' });
  
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/missions', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        // Filter open missions
        const openMissions = res.data.filter(mission => mission.status === 'open');
        setAvailableMissions(openMissions);
        
        // Filter missions the designer has applied to
        const appliedMissions = res.data.filter(mission => 
          mission.designerApplications.some(app => app.designerId === user._id)
        );
        setMyApplications(appliedMissions);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch missions');
        setLoading(false);
      }
    };
    
    fetchMissions();
  }, [user._id]);
  
  const getMissionStatusClass = (status) => {
    switch(status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusClass = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    
    let filtered = availableMissions;
    
    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(mission => 
        mission.name.toLowerCase().includes(term) || 
        mission.context.toLowerCase().includes(term) ||
        mission.demand.toLowerCase().includes(term)
      );
    }
    
    // Filter by UI library
    if (filters.uiLibrary) {
      filtered = filtered.filter(mission => 
        mission.uiLibrary === filters.uiLibrary
      );
    }
    
    setFilteredMissions(filtered);
  };

  useEffect(() => {
    setFilteredMissions(availableMissions);
  }, [availableMissions]);

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
        
        <MissionSearch onSearch={handleSearch} />
        
        {/* My Applications Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Applications</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading your applications...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : myApplications.length === 0 ? (
            <p className="text-gray-600">You haven't applied to any missions yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myApplications.map(mission => {
                // Find this designer's application
                const myApplication = mission.designerApplications.find(
                  app => app.designerId === user._id
                );
                
                return (
                  <Link 
                    key={mission._id} 
                    to={`/missions/${mission._id}`}
                    className="block border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{mission.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getMissionStatusClass(mission.status)}`}>
                          {mission.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">Due: {new Date(mission.dueDate).toLocaleDateString()}</p>
                      <p className="text-gray-600 text-sm mb-2">Credits: {mission.credits}</p>
                      <p className="text-gray-600 text-sm mb-4">UI Library: {mission.uiLibrary}</p>
                      
                      <div className="text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getApplicationStatusClass(myApplication.status)}`}>
                          Application: {myApplication.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Available Missions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Missions</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading available missions...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : filteredMissions.length === 0 ? (
            <p className="text-gray-600">
              {searchFilters.searchTerm || searchFilters.uiLibrary 
                ? "No missions match your search criteria." 
                : "There are no available missions at the moment."}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMissions.map(mission => {
                // Check if designer has already applied
                const hasApplied = mission.designerApplications.some(
                  app => app.designerId === user._id
                );
                
                // Only show missions the designer hasn't applied to
                if (hasApplied) return null;
                
                return (
                  <Link 
                    key={mission._id} 
                    to={`/missions/${mission._id}`}
                    className="block border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{mission.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getMissionStatusClass(mission.status)}`}>
                          {mission.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">Due: {new Date(mission.dueDate).toLocaleDateString()}</p>
                      <p className="text-gray-600 text-sm mb-2">Credits: {mission.credits}</p>
                      <p className="text-gray-600 text-sm mb-4">UI Library: {mission.uiLibrary}</p>
                      
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
                        View Details
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;