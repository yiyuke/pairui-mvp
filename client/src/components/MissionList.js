import React from 'react';
import { Link } from 'react-router-dom';

const MissionList = ({ missions, loading, error, emptyMessage, userRole }) => {
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

  if (loading) {
    return <p className="text-gray-600">Loading missions...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (missions.length === 0) {
    return <p className="text-gray-600">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {missions.map(mission => (
        <Link 
          key={mission._id} 
          to={`/missions/${mission._id}`}
          className="block border rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{mission.name}</h3>
              <span className={`inline-block px-2 py-1 rounded text-xs ${getMissionStatusClass(mission.status)}`}>
                {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">Due: {new Date(mission.dueDate).toLocaleDateString()}</p>
            <p className="text-gray-600 text-sm mb-2">Credits: {mission.credits}</p>
            <p className="text-gray-600 text-sm mb-4">UI Library: {mission.uiLibrary}</p>
            
            {userRole === 'developer' && mission.applications && (
              <div className="text-sm text-gray-500">
                {mission.applications.length === 0 ? (
                  <p>No applications yet</p>
                ) : (
                  <p>{mission.applications.length} application(s)</p>
                )}
              </div>
            )}
            
            <button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
              View Details
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MissionList; 