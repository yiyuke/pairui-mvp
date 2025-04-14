import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import MissionSearch from '../components/MissionSearch';
import { retryRequest } from '../utils/axiosConfig';

const DeveloperDashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [myCreatedMissions, setMyCreatedMissions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [availableDevMissions, setAvailableDevMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ searchTerm: '', uiLibrary: '' });
  
  useEffect(() => {
    if (!user || !user._id) {
      console.log('User not available yet, waiting...');
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchMissions = async () => {
      try {
        console.log('Fetching missions for developer:', user._id);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }
        
        console.log('Making API request to fetch missions');
        const res = await retryRequest({
          method: 'get',
          url: '/missions'
        });
        
        console.log('Missions data received:', res.data.length, 'missions');
        
        // Filter missions created by this developer
        const createdMissions = res.data.filter(mission => 
          mission.creatorId && 
          (typeof mission.creatorId === 'object' ? 
            mission.creatorId._id === user._id : 
            mission.creatorId === user._id)
        );
        
        // Filter missions the developer has applied to
        const appliedMissions = res.data.filter(mission => 
          mission.applications && mission.applications.some(app => 
            app.applicantId && (typeof app.applicantId === 'object' ? 
              app.applicantId._id === user._id : 
              app.applicantId === user._id)
          )
        );
        
        // Filter available development missions (created by designers)
        const availableDevMissions = res.data.filter(mission => 
          mission.status === 'open' && mission.creatorRole === 'designer'
        );
        
        console.log('My created missions:', createdMissions.length);
        console.log('My applications:', appliedMissions.length);
        console.log('Available development missions:', availableDevMissions.length);
        
        setMyCreatedMissions(createdMissions);
        setMyApplications(appliedMissions);
        setAvailableDevMissions(availableDevMissions);
        setFilteredMissions(availableDevMissions);
        setLoading(false);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching missions:', err);
          setError('Failed to fetch missions');
          setLoading(false);
        }
      }
    };
    
    fetchMissions();
    
    // Clean up
    return () => {
      controller.abort();
    };
  }, [user]);

  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, [refreshUser]);

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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    
    let filtered = [...availableDevMissions];
    
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

  const missionsToDisplay = searchFilters.searchTerm || searchFilters.uiLibrary 
    ? filteredMissions 
    : availableDevMissions;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}</h2>
          <p className="text-gray-600 mb-4">
            This is your developer dashboard where you can create design missions and apply for development missions.
          </p>
          
          <Link 
            to="/missions/create" 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Create New Mission
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Created Missions</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-gray-600">Loading your missions...</p>
              </div>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : myCreatedMissions.length === 0 ? (
            <p className="text-gray-600">You haven't created any missions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left">Mission</th>
                    <th className="py-3 px-4 text-left">Due Date</th>
                    <th className="py-3 px-4 text-left">Credits</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myCreatedMissions.map(mission => (
                    <tr key={mission._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{mission.name}</div>
                        <div className="text-sm text-gray-500">{mission.uiLibrary}</div>
                      </td>
                      <td className="py-3 px-4">{formatDate(mission.dueDate)}</td>
                      <td className="py-3 px-4">{mission.credits}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getMissionStatusClass(mission.status)}`}>
                          {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link 
                          to={`/missions/${mission._id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Applications</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-gray-600">Loading your applications...</p>
              </div>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : myApplications.length === 0 ? (
            <p className="text-gray-600">You haven't applied to any missions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left">Mission</th>
                    <th className="py-3 px-4 text-left">Due Date</th>
                    <th className="py-3 px-4 text-left">Credits</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.map(mission => (
                    <tr key={mission._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{mission.name}</div>
                        <div className="text-sm text-gray-500">{mission.uiLibrary}</div>
                      </td>
                      <td className="py-3 px-4">{formatDate(mission.dueDate)}</td>
                      <td className="py-3 px-4">{mission.credits}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getMissionStatusClass(mission.status)}`}>
                          {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link 
                          to={`/missions/${mission._id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Development Missions</h2>
          
          <MissionSearch onSearch={handleSearch} />
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-gray-600">Loading available missions...</p>
              </div>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : missionsToDisplay.length === 0 ? (
            <p className="text-gray-600">No available missions found.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left">Mission</th>
                    <th className="py-3 px-4 text-left">Creator</th>
                    <th className="py-3 px-4 text-left">Due Date</th>
                    <th className="py-3 px-4 text-left">Credits</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {missionsToDisplay.map(mission => (
                    <tr key={mission._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{mission.name}</div>
                        <div className="text-sm text-gray-500">{mission.uiLibrary}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <img 
                            src={mission.creatorId.profile?.avatar || 'https://via.placeholder.com/40'} 
                            alt="Creator" 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          {mission.creatorId.username}
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatDate(mission.dueDate)}</td>
                      <td className="py-3 px-4">{mission.credits}</td>
                      <td className="py-3 px-4">
                        <Link 
                          to={`/missions/${mission._id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;