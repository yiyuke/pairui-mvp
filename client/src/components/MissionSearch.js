import React, { useState } from 'react';

const MissionSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uiLibrary, setUiLibrary] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ searchTerm, uiLibrary });
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Search Missions</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or context"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UI Library
            </label>
            <select
              value={uiLibrary}
              onChange={(e) => setUiLibrary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Libraries</option>
              <option value="Material UI">Material UI</option>
              <option value="Tailwind CSS">Tailwind CSS</option>
              <option value="Bootstrap">Bootstrap</option>
              <option value="Chakra UI">Chakra UI</option>
              <option value="Ant Design">Ant Design</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MissionSearch; 