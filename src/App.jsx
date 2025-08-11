import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CrackTheSafe from './pages/CrackTheSafe';
import WhatsInTheBox from './pages/WhatsInTheBox';
import PrivateRoute from './components/PrivateRoute';
import { isLoggedIn } from './lib/auth';

// Public play pages (no login)
import CrackSafePublic from './pages/play/CrackSafePublic';
import WhatsInTheBoxPublic from './pages/play/WhatsInTheBoxPublic';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* Public game URLs for players (QR codes will point here) */}
        <Route path="/play/crack-the-safe" element={<CrackSafePublic />} />
        <Route path="/play/whats-in-the-box" element={<WhatsInTheBoxPublic />} />

        {/* Manager / protected area */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crack-the-safe" element={<CrackTheSafe />} />
          <Route path="/whats-in-the-box" element={<WhatsInTheBox />} />
        </Route>

        {/* Default + catch-all */}
        <Route path="/" element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}