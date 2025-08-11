import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import { isLoggedIn } from './lib/auth';

import ThemeShell from './components/ThemeShell';

import Home from './pages/Home';
import DashboardPage from './DashboardPage';
import LoginPage from './LoginPage';

import CrackSafePublic from './pages/play/CrackSafePublic';
import WhatsInTheBoxPublic from './pages/play/WhatsInTheBoxPublic';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />

          {/* Public QR routes */}
          <Route path="/play/crack-the-safe" element={<CrackSafePublic />} />
          <Route path="/play/whats-in-the-box" element={<WhatsInTheBoxPublic />} />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </ThemeShell>
    </BrowserRouter>
  );
}