import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { isLoggedIn } from './lib/auth';
import PrivateRoute from './components/PrivateRoute';
import TopNav from './components/TopNav';

import Home from './pages/Home';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

import CrackSafePublic from './pages/play/CrackSafePublic';
import WhatsInTheBoxPublic from './pages/play/WhatsInTheBoxPublic';

export default function App() {
  return (
    <BrowserRouter>
      <div style={shell}>
        <TopNav />
        <main style={main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            {/* Public play pages (QR) */}
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
        </main>
      </div>
    </BrowserRouter>
  );
}

const shell = {
  minHeight:'100vh',
  background:'linear-gradient(180deg,#0b1220 0%, #0f172a 100%)',
  color:'#e5e7eb',
  fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
  display:'grid',
  gridTemplateRows:'auto 1fr'
};
const main = { padding:20, maxWidth:1100, margin:'0 auto', width:'100%' };