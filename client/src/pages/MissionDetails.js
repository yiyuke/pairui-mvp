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
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Move isCreator declaration here, before it's used in useEffect
  const isCreator = mission && user && mission.creatorId._id === user._id;
  
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
    if (mission) {
      // Find the current user's application if they have one
      if (user && !isCreator) {
        const application = mission.applications.find(
          app => app.applicantId._id === user._id
        );
        setUserApplication(application);
        console.log("User application:", application);
      }
      
      // Find the accepted application with submission
      if (mission.applications && mission.applications.length > 0) {
        console.log("All applications:", mission.applications);
        
        const accepted = mission.applications.find(
          app => app.status === 'accepted'
        );
        
        console.log("Found accepted application:", accepted);
        setAcceptedApplication(accepted);
        
        // Log if there's a submission link
        if (accepted && accepted.submittedLink) {
          console.log("Submission link found:", accepted.submittedLink);
        }
      }
    }
  }, [mission, user, isCreator]);
  
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
      setSubmitting(true);
      console.log("Submitting link:", figmaLink);
      
      const res = await axios.put(
        `http://localhost:5001/api/missions/${id}/submit`,
        { submittedLink: figmaLink },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      console.log("Submission response:", res.data);
      setMission(res.data);
      setFigmaLink('');
      setShowSuccessModal(true);
      setSuccessMessage('Your work has been submitted successfully!');
      setSubmitting(false);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.msg || 'Failed to submit work');
      setSubmitting(false);
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
    if (!revisionComments.trim()) {
      setError('Please provide revision comments');
      return;
    }
    
    try {
      setSubmitting(true);
      const res = await axios.put(
        `http://localhost:5001/api/missions/${id}/request-revision`,
        { revisionComments },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      setMission(res.data);
      setRevisionComments('');
      setShowSuccessModal(true);
      setSuccessMessage('Revision requested successfully');
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to request revision');
      setSubmitting(false);
    }
  };
  
  const handleResubmit = async () => {
    try {
      setSubmitting(true);
      console.log("Resubmitting link:", figmaLink);
      
      const res = await axios.put(
        `http://localhost:5001/api/missions/${id}/submit`,
        { submittedLink: figmaLink },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      console.log("Resubmission response:", res.data);
      setMission(res.data);
      setFigmaLink('');
      setShowSuccessModal(true);
      setSuccessMessage('Your work has been resubmitted successfully!');
      setSubmitting(false);
    } catch (err) {
      console.error("Resubmission error:", err);
      setError(err.response?.data?.msg || 'Failed to resubmit work');
      setSubmitting(false);
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
  
  const refreshMissionData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5001/api/missions/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      console.log("Refreshed mission data:", res.data);
      setMission(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing mission:', err);
      setError('Failed to refresh mission details');
      setLoading(false);
    }
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
                {userApplication.submittedLink && (
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
                    
                    {/* Show revision request if any */}
                    {userApplication.revisionRequested && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">Revision Requested</h3>
                        <p className="text-sm text-yellow-700 mb-2">
                          The mission creator has requested revisions to your submission:
                        </p>
                        <div className="bg-white p-3 rounded border border-yellow-200 mb-3">
                          <p className="text-gray-700">{userApplication.revisionComments}</p>
                        </div>
                        <p className="text-sm text-yellow-700 mb-4">
                          Requested on: {new Date(userApplication.revisionRequestedAt).toLocaleString()}
                        </p>
                        
                        {/* Resubmission form */}
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700 mb-2">Resubmit Your Work</h4>
                          <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newSubmission">
                              New Submission Link:
                            </label>
                            <input
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              id="newSubmission"
                              type="text"
                              value={figmaLink}
                              onChange={(e) => setFigmaLink(e.target.value)}
                              placeholder="Enter your new submission link"
                            />
                          </div>
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleResubmit}
                            disabled={!figmaLink || submitting}
                          >
                            {submitting ? 'Resubmitting...' : 'Resubmit Work'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {userApplication && userApplication.status === 'accepted' && userApplication.submittedLink && (
                      <>
                        {mission.status === 'completed' ? (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-2">Mission Completed</h3>
                            <p className="text-sm text-green-700 mb-2">
                              This mission has been completed successfully!
                            </p>
                            {mission.feedback && (
                              <div className="mt-3">
                                <h4 className="font-medium text-gray-700 mb-1">Feedback from Creator:</h4>
                                <div className="flex items-center mb-2">
                                  <span className="font-semibold mr-2">Rating:</span>
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
                                <div className="bg-white p-3 rounded border border-green-200">
                                  <p className="text-gray-700">{mission.feedback.comments}</p>
                                </div>
                                <p className="text-sm text-green-700 mt-2">
                                  You received {mission.credits} credits for this mission!
                                </p>
                              </div>
                            )}
                          </div>
                        ) : userApplication.revisionRequested ? (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 mb-2">Revision Requested</h3>
                            <p className="text-sm text-yellow-700 mb-2">
                              The mission creator has requested revisions to your submission:
                            </p>
                            <div className="bg-white p-3 rounded border border-yellow-200 mb-3">
                              <p className="text-gray-700">{userApplication.revisionComments}</p>
                            </div>
                            <p className="text-sm text-yellow-700 mb-4">
                              Requested on: {new Date(userApplication.revisionRequestedAt).toLocaleString()}
                            </p>
                            
                            {/* Resubmission form */}
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-700 mb-2">Resubmit Your Work</h4>
                              <div className="mb-3">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newSubmission">
                                  New Submission Link:
                                </label>
                                <input
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  id="newSubmission"
                                  type="text"
                                  value={figmaLink}
                                  onChange={(e) => setFigmaLink(e.target.value)}
                                  placeholder="Enter your new submission link"
                                />
                              </div>
                              <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={handleResubmit}
                                disabled={!figmaLink || submitting}
                              >
                                {submitting ? 'Resubmitting...' : 'Resubmit Work'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">Awaiting Feedback</h3>
                            <p className="text-sm text-blue-700">
                              The mission creator is reviewing your submission.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Show submission form if not yet submitted */}
                {!userApplication.submittedLink && (
                  <div className="mt-4">
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
                      disabled={!figmaLink || submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Work'}
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
        {isCreator && (mission.status === 'in-progress' || mission.status === 'completed') && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {mission.status === 'completed' ? 'Completed Work' : 'Submitted Work'}
              {mission.status === 'in-progress' && (
                <button
                  onClick={refreshMissionData}
                  className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-sm flex items-center inline-flex"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </button>
              )}
            </h2>
            
            {/* Check if there's a submission */}
            {acceptedApplication && acceptedApplication.submittedLink ? (
              <div>
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
                </div>
                
                {/* Submission Preview */}
                <div className="mt-4 mb-6">
                  {/* Figma Preview */}
                  {acceptedApplication.submittedLink.includes('figma.com') && (
                    <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
                      <iframe 
                        title="Figma Preview"
                        width="100%" 
                        height="100%" 
                        src={`${acceptedApplication.submittedLink.replace('file', 'embed')}`}
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                  
                  {/* GitHub Preview */}
                  {acceptedApplication.submittedLink.includes('github.com') && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-2">GitHub Repository:</p>
                      <a 
                        href={acceptedApplication.submittedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
                        </svg>
                        View Repository
                      </a>
                    </div>
                  )}
                  
                  {/* Generic Website Preview */}
                  {!acceptedApplication.submittedLink.includes('figma.com') && 
                   !acceptedApplication.submittedLink.includes('github.com') && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-2">Submitted Link:</p>
                      <a 
                        href={acceptedApplication.submittedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        {acceptedApplication.submittedLink}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Show feedback options only if mission is still in progress */}
                {mission.status === 'in-progress' && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Provide Feedback</h3>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Rating:
                      </label>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFeedback({...feedback, rating: i + 1})}
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
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feedbackComments">
                        Comments:
                      </label>
                      <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="feedbackComments"
                        rows="4"
                        value={feedback.comments}
                        onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
                        placeholder="Provide feedback on the submitted work"
                      ></textarea>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleProvideFeedback}
                        disabled={submitting}
                      >
                        {submitting ? 'Processing...' : 'Accept & Complete Mission'}
                      </button>
                      
                      <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => document.getElementById('revisionModal').classList.remove('hidden')}
                      >
                        Request Revisions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">The accepted applicant hasn't submitted their work yet.</p>
            )}
          </div>
        )}
        
        {/* Revision Request Modal */}
        <div id="revisionModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Request Revisions</h3>
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
                placeholder="Explain what changes you'd like to see"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => document.getElementById('revisionModal').classList.add('hidden')}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => {
                  handleRequestRevision();
                  document.getElementById('revisionModal').classList.add('hidden');
                }}
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
        
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
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Success!</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{successMessage}</p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    OK
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