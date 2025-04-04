import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChooseRole from './pages/ChooseRole';
import DeveloperDashboard from './pages/DeveloperDashboard';
import DesignerDashboard from './pages/DesignerDashboard';
import CreateMission from './pages/CreateMission';
import MissionDetails from './pages/MissionDetails';
import Profile from './pages/Profile';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <NotificationProvider>
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
              <Route path="/profile/:id" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              {/* Catch-all redirect to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App; 