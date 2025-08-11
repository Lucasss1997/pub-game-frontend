import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout / pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Login from './pages/Login';

// Public game pages
import CrackSafePublic from './pages/play/CrackSafePublic';
import WhatsInTheBoxPublic from './pages/play/WhatsInTheBoxPublic';

// Optional: Protected route wrapper if you have authentication
import PrivateRoute from './components/PrivateRoute';

// Common layout (navbar/footer)
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Public game routes (no login required) */}
        <Route path="/play/crack-the-safe" element={<CrackSafePublic />} />
        <Route path="/play/whats-in-the-box" element={<WhatsInTheBoxPublic />} />

        {/* Auth-protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <PrivateRoute>
              <Billing />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;