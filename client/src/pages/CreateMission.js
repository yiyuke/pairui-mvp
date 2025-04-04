// client/src/pages/CreateMission.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const CreateMission = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setState] = useState({
    name: '',
    context: '',
    demand: '',
    uiLibrary: '',
    dueDate: '',
    credits: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, context, demand, uiLibrary, dueDate, credits } = formData;

  const onChange = e => {
    setState({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!name || !context || !demand || !uiLibrary || !dueDate || !credits) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      };

      const body = JSON.stringify({ name, context, demand, uiLibrary, dueDate, credits });
      
      await axios.post('http://localhost:5001/api/missions', body, config);
      
      setLoading(false);
      navigate('/developer/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create mission');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Create a New {user.role === 'developer' ? 'Design' : 'Development'} Mission
        </h1>
        
        <p className="text-gray-600 mb-4">
          {user.role === 'developer' 
            ? 'Create a mission to find a designer for your project.' 
            : 'Create a mission to find a developer to implement your design.'}
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Mission Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="Enter mission name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="context">
                Context
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="context"
                name="context"
                value={context}
                onChange={onChange}
                placeholder="Describe the context of your project"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="demand">
                Demand
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="demand"
                name="demand"
                value={demand}
                onChange={onChange}
                placeholder="Describe what you need from the designer"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="uiLibrary">
                UI Library
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="uiLibrary"
                name="uiLibrary"
                value={uiLibrary}
                onChange={onChange}
              >
                <option value="">Select UI Library</option>
                <option value="Material UI">Material UI</option>
                <option value="Tailwind CSS">Tailwind CSS</option>
                <option value="Bootstrap">Bootstrap</option>
                <option value="Chakra UI">Chakra UI</option>
                <option value="Ant Design">Ant Design</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                Due Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="dueDate"
                type="date"
                name="dueDate"
                value={dueDate}
                onChange={onChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="credits">
                Credits
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="credits"
                type="number"
                name="credits"
                value={credits}
                onChange={onChange}
                placeholder="Enter credit amount"
                min="1"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Mission'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMission;