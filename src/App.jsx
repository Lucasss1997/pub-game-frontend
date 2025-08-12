// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import TopNav from './components/TopNav';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Raffle from './pages/Raffle';
import Enter from './pages/Enter';

import CrackSafePublic from './pages/play/CrackSafePublic';
import WhatsInTheBoxPublic from './pages/play/WhatsInTheBoxPublic';

// Simple layout wrappers so TopNav shows on both public & private pages
function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e5e7eb' }}>
      <TopNav />
      <Outlet />
    </div>
  );
}

function PrivateLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e5e7eb' }}>
      <TopNav />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Public entry (QR → pay) */}
          <Route path="/enter/:pubId/:gameKey" element={<Enter />} />

          {/* Public play pages (customers can access directly or via QR) */}
          <Route path="/play/crack-the-safe" element={<CrackSafePublic />} />
          <Route path="/play/whats-in-the-box" element={<WhatsInTheBoxPublic />} />
        </Route>

        {/* Private (requires auth) */}
        <Route element={<PrivateRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/raffle" element={<Raffle />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Not found</h1>
      <p>That page doesn’t exist.</p>
      <a href="/" style={{ color: '#22c55e', textDecoration: 'none' }}>Go home</a>
    </div>
  );
}