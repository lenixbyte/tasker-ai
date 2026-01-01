import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import Auth from './views/Auth';
import GroupSetup from './views/GroupSetup';
import { runDailyAutomation } from './utils/taskAutomation';

import Dashboard from './views/Dashboard';
import AllTasks from './views/AllTasks';

const PrivateRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (!userData?.groupId) return <GroupSetup />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/all-tasks"
              element={
                <PrivateRoute>
                  <AllTasks />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
