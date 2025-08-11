import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { isLoggedIn } from './lib/auth';
import PrivateRoute from './components/PrivateRoute';
import ThemeShell from './components/ThemeShell';

import Home from './pages/Home';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

// Public QR pages
import CrackSafePublic from './pages/play/CrackSafePublic';
import WhatsInTheBoxPublic from './pages/play/WhatsInTheBoxPublic';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeShell>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />

          {/* Public play routes (QR) */}
          <Route path="/play/crack-the-safe" element={<CrackSafePublic />} />
          <Route path="/play/whats-in-the-box" element={<WhatsInTheBoxPublic />} />

          {/* Protected area */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Catch-all */}
          <Route
            path="*"
            element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </ThemeShell>
    </BrowserRouter>
  );
}