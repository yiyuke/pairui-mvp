import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChooseRole from './pages/ChooseRole';
import DeveloperDashboard from './pages/DeveloperDashboard';
import DesignerDashboard from './pages/DesignerDashboard';
import CreateMission from './pages/CreateMission';
import MissionDetails from './pages/MissionDetails';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/choose-role" element={
              <PrivateRoute>
                <ChooseRole />
              </PrivateRoute>
            } />
            <Route path="/developer/dashboard" element={
              <PrivateRoute>
                <DeveloperDashboard />
              </PrivateRoute>
            } />
            <Route path="/designer/dashboard" element={
              <PrivateRoute>
                <DesignerDashboard />
              </PrivateRoute>
            } />
            <Route path="/missions/create" element={
              <PrivateRoute>
                <CreateMission />
              </PrivateRoute>
            } />
            <Route path="/missions/:id" element={
              <PrivateRoute>
                <MissionDetails />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 