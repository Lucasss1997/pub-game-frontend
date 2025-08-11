// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth helpers / guards
import PrivateRoute from './components/PrivateRoute';
import { isLoggedIn } from './lib/auth';

// Pages (note: DashboardPage.jsx & LoginPage.jsx live at src/, Home.jsx lives in src/pages/)
import Home from './pages/Home';
import DashboardPage from './DashboardPage';
import LoginPage from './LoginPage';

// Public (QR) game pages
import CrackSafePublic from './pages/play/CrackSafePublic';
import WhatsInTheBoxPublic from './pages/play/WhatsInTheBoxPublic';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Public QR play pages (no login) */}
        <Route path="/play/crack-the-safe" element={<CrackSafePublic />} />
        <Route path="/play/whats-in-the-box" element={<WhatsInTheBoxPublic />} />

        {/* Protected area */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}