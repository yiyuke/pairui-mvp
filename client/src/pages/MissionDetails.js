// client/src/pages/MissionDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState(null);
  const [revisionComments, setRevisionComments] = useState('');
  const [userApplication, setUserApplication] = useState(null);
  const [acceptedApplication, setAcceptedApplication] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
        console.error('Error fetching mission:', err);
        setError('Failed to fetch mission details');
        setLoading(false);
      }
    };
    
    fetchMission();
  }, [id]);
  
  useEffect(() => {
    if (mission && user) {
      // Find the current user's application if they have one
      const application = mission.applications.find(
        app => app.applicantId._id === user._id
      );
      setUserApplication(application);
      
      // Find the accepted application
      const accepted = mission.applications.find(
        app => app.status === 'accepted'
      );
      setAcceptedApplication(accepted);
    }
  }, [mission, user]);
  
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
  
  const handleOpenRejectionModal = (applicationId) => {
    setCurrentApplicationId(applicationId);
    setShowRejectionModal(true);
  };
  
  const handleRespondToApplication = async (applicationId, status) => {
    try {
      if (status === 'accepted') {
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
      } else if (status === 'rejected') {
        handleOpenRejectionModal(applicationId);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to respond to application');
    }
  };
  
  const handleRejectWithNote = async () => {
    try {
      console.log('Sending rejection note:', rejectionNote);
      const res = await axios.put(
        `http://localhost:5001/api/missions/${id}/applications/${currentApplicationId}`,
        { 
          status: 'rejected',
          rejectionNote: rejectionNote 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setMission(res.data);
      setShowRejectionModal(false);
      setRejectionNote('');
      setCurrentApplicationId(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reject application');
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
      
      // Show success modal instead of alert
      setShowSuccessModal(true);
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
  
  const handleRequestRevision = async () => {
    if (!revisionComments) {
      setError('Please provide details about the requested revisions');
      return;
    }
    
    try {
      const res = await axios.post(
        `http://localhost:5001/api/missions/${id}/request-revision`,
        { comments: revisionComments },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      setMission(res.data);
      setRevisionComments('');
      alert('Revision request sent successfully');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to request revisions');
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
  
  const handleGoBack = () => {
    navigate(`/${user.role}/dashboard`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading mission details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!mission) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Mission not found</p>
        </div>
      </div>
    );
  }
  
  // Check if the current user is the creator of this mission
  const isCreator = mission.creatorId._id === user._id;
  
  // Debug log
  console.log('User application:', userApplication);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{mission.name}</h1>
          <div className="flex items-center">
            {isCreator && mission.status === 'open' && (
              <Link 
                to={`/missions/${mission._id}/edit`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit Mission
              </Link>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleGoBack}
          className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Mission Details</h2>
              <p className="mb-2">
                <span className="font-semibold">Created by:</span>{' '}
                {mission.creatorId.username || 'Unknown'}
                {mission.creatorRole && ` (${mission.creatorRole.charAt(0).toUpperCase() + mission.creatorRole.slice(1)})`}
              </p>
              <p className="mb-2">
                <span className="font-semibold">UI Library:</span> {mission.uiLibrary}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Due Date:</span> {formatDate(mission.dueDate)}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs
                  ${mission.status === 'open' ? 'bg-blue-100 text-blue-800' : 
                    mission.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'}`}
                >
                  {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                </span>
              </p>
              <div className="mb-4">
                <span className="font-semibold">Credits:</span> {mission.credits}
                {mission.status === 'open' && user._id === mission.creatorId._id && (
                  <span className="text-gray-500 text-sm ml-2">
                    (These credits are reserved from your account until the mission is completed or deleted)
                  </span>
                )}
                {mission.status === 'completed' && (
                  <span className="text-green-500 text-sm ml-2">
                    {user._id === acceptedApplication?.applicantId._id 
                      ? 'These credits have been added to your account!' 
                      : 'These credits have been transferred to the applicant.'}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Context:</h3>
                <p className="text-gray-700">{mission.context}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Demand:</h3>
                <p className="text-gray-700">{mission.demand}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Figma link for designer missions */}
        {mission.figmaLink && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Design Reference</h2>
            <p className="mb-4">
              <a
                href={mission.figmaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                View Figma Design
              </a>
            </p>
          </div>
        )}
        
        {/* Apply for mission section */}
        {!isCreator && mission.status === 'open' && !userApplication && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Apply for this Mission</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
                Application Note:
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="note"
                rows="4"
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
                placeholder="Explain why you're a good fit for this mission"
              ></textarea>
            </div>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleApply}
            >
              Submit Application
            </button>
          </div>
        )}
        
        {/* Submission status section for applicants */}
        {!isCreator && userApplication && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Application Status</h2>
            
            <div className="mb-4">
              <span className="font-semibold">Status:</span>{' '}
              <span className={`px-2 py-1 rounded-full text-xs ${
                userApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                userApplication.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {userApplication.status.charAt(0).toUpperCase() + userApplication.status.slice(1)}
              </span>
            </div>
            
            {userApplication.status === 'rejected' && userApplication.rejectionNote && (
              <div className="mb-4">
                <span className="font-semibold">Rejection Reason:</span>
                <p className="text-gray-700 mt-1">{userApplication.rejectionNote}</p>
              </div>
            )}
            
            {userApplication.status === 'accepted' && (
              <div>
                {userApplication.submittedLink ? (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold mr-2">Submission Status:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Submitted
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      Submitted on: {new Date(userApplication.submittedAt).toLocaleString()}
                    </p>
                    <div className="mb-2">
                      <span className="font-semibold">Your submission:</span>{' '}
                      <a 
                        href={userApplication.submittedLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        {userApplication.submittedLink}
                      </a>
                    </div>
                    
                    {/* Add preview for Figma links */}
                    {userApplication.submittedLink && userApplication.submittedLink.includes('figma.com') && (
                      <div className="mt-4 mb-4">
                        <h3 className="font-semibold mb-2">Figma Preview:</h3>
                        <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
                          <iframe 
                            title="Figma Preview"
                            width="100%" 
                            height="100%" 
                            src={`${userApplication.submittedLink.replace('file', 'embed')}`}
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
                    
                    {mission.status === 'completed' ? (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-700">
                          <span className="font-bold">Mission Completed!</span> You've received {mission.credits} credits.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-700">
                          <span className="font-bold">Awaiting Feedback</span> - The mission creator is reviewing your submission.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-4">
                      Your application has been accepted! Please submit your work using the form below.
                    </p>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="figmaLink">
                        Submission Link (Figma, GitHub, etc.)
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="figmaLink"
                        type="text"
                        value={figmaLink}
                        onChange={(e) => setFigmaLink(e.target.value)}
                        placeholder="Enter your submission link"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Please provide a valid link to your work (e.g., Figma, GitHub, etc.)
                      </p>
                    </div>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={handleSubmitDesign}
                      disabled={!figmaLink}
                    >
                      Submit Work
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Applications section - show for creator even when mission is in progress */}
        {isCreator && (mission.status === 'open' || mission.status === 'in-progress') && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {mission.status === 'open' ? 'Applications' : 'Accepted Applicant'}
            </h2>
            
            {mission.applications.length === 0 ? (
              <p className="text-gray-600">No applications yet.</p>
            ) : (
              <div className="space-y-4">
                {mission.applications
                  .filter(app => mission.status === 'open' || app.status === 'accepted')
                  .map(app => (
                  <div key={app._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <img 
                            src={app.applicantId.profile?.avatar || 'https://via.placeholder.com/40'} 
                            alt="Applicant" 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span className="font-semibold">{app.applicantId.username}</span>
                          {app.status === 'accepted' && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Accepted
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{app.note}</p>
                        {app.submittedLink && (
                          <div className="mt-2">
                            <span className="font-semibold text-green-600">Work Submitted</span>
                            <p className="text-sm text-gray-600">
                              Submitted on: {new Date(app.submittedAt).toLocaleString()}
                            </p>
                            <a 
                              href={app.submittedLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 text-sm"
                            >
                              View Submission
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {mission.status === 'open' && app.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                            onClick={() => handleRespondToApplication(app._id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                            onClick={() => handleRespondToApplication(app._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {app.status !== 'pending' && mission.status === 'open' && (
                        <p className={`text-sm ${app.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Submitted work review section for creators */}
        {isCreator && acceptedApplication && acceptedApplication.submittedLink && mission.status === 'in-progress' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Submitted Work</h2>
            <div className="mb-4">
              <p className="mb-2">
                <span className="font-semibold">Submitted by:</span>{' '}
                {acceptedApplication.applicantId.username}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Submitted on:</span>{' '}
                {new Date(acceptedApplication.submittedAt).toLocaleString()}
              </p>
              <div className="mb-4">
                <span className="font-semibold">Submission Link:</span>{' '}
                <a
                  href={acceptedApplication.submittedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  {acceptedApplication.submittedLink}
                </a>
              </div>
              
              {/* Add iframe preview for Figma links */}
              {acceptedApplication.submittedLink && acceptedApplication.submittedLink.includes('figma.com') && (
                <div className="mt-4 mb-6">
                  <h3 className="font-semibold mb-2">Figma Preview:</h3>
                  <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
                    <iframe 
                      title="Figma Preview"
                      width="100%" 
                      height="100%" 
                      src={`${acceptedApplication.submittedLink.replace('file', 'embed')}`}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Review Options</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Option 1: Accept and Complete Mission</h4>
                    <p className="text-gray-600 mb-4">
                      If you're satisfied with the work, provide feedback and complete the mission.
                      This will transfer {mission.credits} credits to the applicant.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Rating:
                        </label>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={`text-2xl ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                              onClick={() => setFeedback({ ...feedback, rating: star })}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comments">
                          Feedback Comments:
                        </label>
                        <textarea
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="comments"
                          rows="4"
                          value={feedback.comments}
                          onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                          placeholder="Provide feedback on the submitted work"
                        ></textarea>
                      </div>
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleProvideFeedback}
                      >
                        Accept & Complete Mission
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Option 2: Request Revisions</h4>
                    <p className="text-gray-600 mb-4">
                      If you need changes, you can request revisions from the applicant.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="revisionComments">
                          Revision Comments:
                        </label>
                        <textarea
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="revisionComments"
                          rows="4"
                          value={revisionComments}
                          onChange={(e) => setRevisionComments(e.target.value)}
                          placeholder="Describe the changes you need"
                        ></textarea>
                      </div>
                      <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleRequestRevision}
                      >
                        Request Revisions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Feedback section for completed missions */}
        {mission.status === 'completed' && mission.feedback && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Feedback</h2>
            <div className="mb-2">
              <span className="font-semibold">Rating:</span>{' '}
              <span className="text-yellow-400">
                {Array(mission.feedback.rating).fill('★').join('')}
              </span>
              <span className="text-gray-300">
                {Array(5 - mission.feedback.rating).fill('★').join('')}
              </span>
            </div>
            <div>
              <span className="font-semibold">Comments:</span>
              <p className="mt-1">{mission.feedback.comments}</p>
            </div>
          </div>
        )}
        
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Reject Application</h3>
              <p className="mb-4 text-gray-600">Please provide a reason for rejection:</p>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows="4"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Explain why you're rejecting this application..."
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectWithNote}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Submission Successful!</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your work has been submitted successfully. The mission creator will review it soon.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDetails;