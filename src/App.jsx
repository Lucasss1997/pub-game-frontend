import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './ui/neon.css';

// NEW neon pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enter from './pages/Enter';
import CrackTheSafe from './pages/CrackTheSafe';
import WhatsInTheBox from './pages/WhatsInTheBox';
import Pricing from './pages/Pricing';
import Raffle from './pages/Raffle';
import Billing from './pages/Billing';

// If you use auth guards, swap this for your real check
const isAuthed = () => !!localStorage.getItem('token');

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function Home() {
  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{ maxWidth: 980 }}>
        <section className="card dashboard">
          <h2>Welcome to Pub Game</h2>
          <small>Scan a QR to play, or sign in to manage your pub’s games.</small>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <a className="btn" href="/login">Sign in</a>
            <a className="btn ghost" href="/crack-the-safe">Crack the Safe (demo)</a>
            <a className="btn ghost" href="/whats-in-the-box">What’s in the Box (demo)</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/enter/:pubId/:gameKey" element={<Enter/>} />
        <Route path="/crack-the-safe" element={<CrackTheSafe/>} />
        <Route path="/whats-in-the-box" element={<WhatsInTheBox/>} />
        <Route path="/pricing" element={<PrivateRoute><Pricing/></PrivateRoute>} />
        <Route path="/raffle" element={<PrivateRoute><Raffle/></PrivateRoute>} />
        <Route path="/billing" element={<PrivateRoute><Billing/></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </BrowserRouter>
  );
}