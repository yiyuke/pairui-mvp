// client/src/pages/MissionDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const MissionDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationNote, setApplicationNote] = useState('');
  const [figmaLink, setFigmaLink] = useState('');
  const [feedback, setFeedback] = useState({ rating: 5, comments: '' });
  
  useEffect(() => {
    const fetchMission = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/missions/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setMission(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch mission details');
        setLoading(false);
      }
    };
    
    fetchMission();
  }, [id]);
  
  const handleApply = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5001/api/missions/${id}/apply`,
        { note: applicationNote },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setMission(res.data);
      setApplicationNote('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to apply for mission');
    }
  };
  
  const handleRespondToApplication = async (applicationId, status) => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/missions/${id}/applications/${applicationId}`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setMission(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to respond to application');
    }
  };
  
  const handleSubmitDesign = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/missions/${id}/submit`,
        { figmaLink },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setMission(res.data);
      setFigmaLink('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit design');
    }
  };
  
  const handleProvideFeedback = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/missions/${id}/feedback`,
        feedback,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setMission(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to provide feedback');
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatApplicationStatus = (status) => {
    switch(status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <p className="text-xl">Loading mission details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!mission) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-xl">Mission not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Check if user is the developer who created this mission
  const isDeveloper = user._id === mission.developerId;
  
  // Check if user is a designer who applied for this mission
  const designerApplication = mission.designerApplications.find(
    app => app.designerId === user._id
  );
  
  // Check if there's an accepted designer
  const acceptedDesigner = mission.designerApplications.find(
    app => app.status === 'accepted'
  );
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{mission.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold
            ${mission.status === 'open' ? 'bg-blue-100 text-blue-800' : 
              mission.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'}`}
          >
            {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
          </span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Mission Details</h2>
              <p className="text-gray-700 mb-4"><span className="font-semibold">Context:</span> {mission.context}</p>
              <p className="text-gray-700 mb-4"><span className="font-semibold">Demand:</span> {mission.demand}</p>
              <p className="text-gray-700 mb-4"><span className="font-semibold">UI Library:</span> {mission.uiLibrary}</p>
              <p className="text-gray-700 mb-4"><span className="font-semibold">Due Date:</span> {formatDate(mission.dueDate)}</p>
              <p className="text-gray-700 mb-4"><span className="font-semibold">Credits:</span> {mission.credits}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Status</h2>
              {mission.status === 'open' && (
                <p className="text-blue-600">This mission is open for applications</p>
              )}
              {mission.status === 'in-progress' && (
                <p className="text-yellow-600">This mission is currently in progress</p>
              )}
              {mission.status === 'completed' && (
                <p className="text-green-600">This mission has been completed</p>
              )}
              
              {mission.feedback && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Feedback</h3>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">Rating:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < mission.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2">{mission.feedback.comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Designer Application Section */}
        {user.role === 'designer' && mission.status === 'open' && !designerApplication && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Apply for this Mission</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
                Application Note
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="note"
                rows="3"
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
                placeholder="Explain why you're a good fit for this mission"
              ></textarea>
            </div>
            <button
              onClick={handleApply}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Apply
            </button>
          </div>
        )}
        
        {/* Designer's Application Status */}
        {user.role === 'designer' && designerApplication && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Application</h2>
            <p className="mb-2">
              <span className="font-semibold">Status:</span>{' '}
              {formatApplicationStatus(designerApplication.status)}
            </p>
            <p className="mb-4"><span className="font-semibold">Your Note:</span> {designerApplication.note}</p>
            
            {/* Submit Design Section (for accepted designers) */}
            {designerApplication.status === 'accepted' && !designerApplication.submittedFigmaLink && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Submit Your Design</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="figmaLink">
                    Figma Link
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="figmaLink"
                    type="text"
                    value={figmaLink}
                    onChange={(e) => setFigmaLink(e.target.value)}
                    placeholder="Paste your Figma design link here"
                  />
                </div>
                <button
                  onClick={handleSubmitDesign}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit Design
                </button>
              </div>
            )}
            
            {/* Show submitted design */}
            {designerApplication.submittedFigmaLink && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Your Submitted Design</h3>
                <p className="mb-2">
                  <span className="font-semibold">Submitted on:</span>{' '}
                  {formatDate(designerApplication.submittedAt)}
                </p>
                <a
                  href={designerApplication.submittedFigmaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  View Figma Design
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Developer's View - Applications */}
        {isDeveloper && mission.status === 'open' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Designer Applications</h2>
            {mission.applications.length === 0 ? (
              <p>No applications yet</p>
            ) : (
              <div className="space-y-4">
                {mission.applications.map((app) => (
                  <div key={app._id} className="border rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <img 
                        src={app.applicantId.profile.avatar} 
                        alt={app.applicantId.username} 
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-semibold text-lg">{app.applicantId.username}</p>
                        <p className="text-sm text-gray-600">
                          {formatApplicationStatus(app.status)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="mb-4"><span className="font-semibold">Note:</span> {app.note}</p>
                    
                    {app.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRespondToApplication(app._id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondToApplication(app._id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Developer's View - Accepted Designer's Work */}
        {isDeveloper && acceptedDesigner && acceptedDesigner.submittedFigmaLink && mission.status === 'in-progress' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Submitted Design</h2>
            <p className="mb-2">
              <span className="font-semibold">Submitted on:</span>{' '}
              {formatDate(acceptedDesigner.submittedAt)}
            </p>
            <p className="mb-4">
              <a
                href={acceptedDesigner.submittedFigmaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                View Figma Design
              </a>
            </p>
            
            <h3 className="text-lg font-semibold mb-2">Provide Feedback</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Rating
              </label>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFeedback({ ...feedback, rating: i + 1 })}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comments">
                Comments
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="comments"
                rows="3"
                value={feedback.comments}
                onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                placeholder="Provide feedback on the design"
              ></textarea>
            </div>
            <button
              onClick={handleProvideFeedback}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Feedback & Complete Mission
            </button>
          </div>
        )}
        
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default MissionDetails;