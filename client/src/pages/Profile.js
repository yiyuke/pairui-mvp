import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    role: '',
    bio: '',
    avatar: '',
    skills: '',
    portfolio: ''
  });
  
  const isOwnProfile = currentUser?._id === id;
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setUser(res.data);
        setFormData({
          username: res.data.username || '',
          role: res.data.role || '',
          bio: res.data.profile?.bio || '',
          avatar: res.data.profile?.avatar || '',
          skills: res.data.profile?.skills ? res.data.profile.skills.join(', ') : '',
          portfolio: res.data.profile?.portfolio || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch user profile');
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    
    try {
      // Update profile data
      const profileData = {
        bio: formData.bio,
        avatar: formData.avatar,
        skills: formData.skills,
        portfolio: formData.portfolio
      };
      
      console.log('Updating profile data:', profileData);
      
      await axios.put(
        'http://localhost:5001/api/users/profile',
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // If username or role changed, update user data
      if (formData.username !== user.username || formData.role !== user.role) {
        console.log('Updating user data:', {
          username: formData.username,
          role: formData.role
        });
        
        try {
          await axios.put(
            'http://localhost:5001/api/users',
            {
              username: formData.username,
              role: formData.role
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
              }
            }
          );
        } catch (userUpdateErr) {
          console.error('Error updating user data:', userUpdateErr);
          if (userUpdateErr.response) {
            console.error('Response data:', userUpdateErr.response.data);
            console.error('Response status:', userUpdateErr.response.status);
          }
          throw new Error(userUpdateErr.response?.data?.msg || 'Failed to update user data');
        }
      }
      
      // Refresh user data
      const res = await axios.get(`http://localhost:5001/api/users/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setUser(res.data);
      
      // Refresh the user context to update the navbar and other components
      await refreshUser();
      
      setIsEditing(false);
      
      // If role was changed, redirect to the appropriate dashboard
      if (formData.role !== user.role) {
        navigate(`/${formData.role}/dashboard`);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      setError(err.message || 'Failed to update profile');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">User not found</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            {/* Header section with avatar and basic info */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 border-b pb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden">
                {isEditing ? (
                  <>
                    <img 
                      src={formData.avatar || 'https://via.placeholder.com/150'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white cursor-pointer rounded-full"
                    >
                      <span>Change</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                ) : (
                  <img 
                    src={user.profile?.avatar || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-indigo-500 mb-4 bg-transparent w-full max-w-xs"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{user.username}</h1>
                )}
                
                <div className="mt-6">
                  {isEditing ? (
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="text-lg text-gray-600 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                    </select>
                  ) : (
                    <p className="text-lg text-gray-600">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile content section */}
            {!isEditing ? (
              <div className="mt-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Skills:</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.profile?.skills && user.profile.skills.length > 0 ? (
                      user.profile.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Bio:</h2>
                  <p className="text-gray-700">{user.profile?.bio || 'No bio provided'}</p>
                </div>
                
                {user.profile?.portfolio && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Portfolio:</h2>
                    <a 
                      href={user.profile.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {user.profile.portfolio}
                    </a>
                  </div>
                )}
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Credits:</h2>
                  <p className="text-gray-700 text-2xl font-bold text-indigo-600">
                    {user.credits || 0}
                  </p>
                </div>
                
                {isOwnProfile && (
                  <div className="mt-8">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8">
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                      Bio
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="bio"
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="skills">
                      Skills (comma separated)
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="skills"
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, UI Design, Node.js"
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="portfolio">
                      Portfolio URL
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="portfolio"
                      type="text"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded mr-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 