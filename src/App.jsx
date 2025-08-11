import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CrackTheSafe from './pages/CrackTheSafe';
import WhatsInTheBox from './pages/WhatsInTheBox';
import PrivateRoute from './components/PrivateRoute';
import { isLoggedIn } from './lib/auth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* All protected routes go under PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crack-the-safe" element={<CrackTheSafe />} />
          <Route path="/whats-in-the-box" element={<WhatsInTheBox />} />
        </Route>

        {/* Default route */}
        <Route path="/" element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />} />

        {/* Catch-all: if authed -> dashboard, else -> login */}
        <Route path="*" element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}