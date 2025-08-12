// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './ui/pubgame-solid.css';

// Pages (solid theme versions)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Enter from './pages/Enter';
import CrackTheSafe from './pages/CrackTheSafe';
import WhatsInTheBox from './pages/WhatsInTheBox';
import Pricing from './pages/Pricing';
import Raffle from './pages/Raffle';
import Billing from './pages/Billing';

// Simple auth gate (swap for your real check if different)
const isAuthed = () => !!localStorage.getItem('token');
const Private = ({ children }) => (isAuthed() ? children : <Navigate to="/login" replace />);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard if logged in; otherwise to login */}
        <Route
          path="/"
          element={isAuthed() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/enter/:pubId/:gameKey" element={<Enter />} />
        <Route path="/crack-the-safe" element={<CrackTheSafe />} />
        <Route path="/whats-in-the-box" element={<WhatsInTheBox />} />

        {/* Auth‑required */}
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/admin" element={<Private><Admin /></Private>} />
        <Route path="/pricing" element={<Private><Pricing /></Private>} />
        <Route path="/raffle" element={<Private><Raffle /></Private>} />
        <Route path="/billing" element={<Private><Billing /></Private>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}