// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Keep your existing theme import (does not change the design)
import "./ui/pubgame-theme.css";

// Pages (make sure these files already exist)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Billing from "./pages/Billing";
import Pricing from "./pages/Pricing";
import Raffle from "./pages/Raffle";
import Enter from "./pages/Enter";
import CrackTheSafe from "./pages/CrackTheSafe";
import WhatsInTheBox from "./pages/WhatsInTheBox";

// If you have helpers for auth, you can keep using them.
// We also allow a localStorage token check so it works
// with either cookie-based or token-in-storage flows.
const isAuthed = () => {
  try {
    // prefer an explicit flag/token you already set in Login
    const token = localStorage.getItem("token");
    // you might also set something like `localStorage.setItem('authed','1')`
    const authedFlag = localStorage.getItem("authed");
    return Boolean(token || authedFlag);
  } catch {
    return false;
  }
};

// PrivateRoute wrapper
function PrivateRoute({ children }) {
  const location = useLocation();
  if (!isAuthed()) {
    // redirect to /login and remember where we wanted to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

// Optional: a tiny not found page so unknown routes don’t look broken
function NotFound() {
  return (
    <div className="wrap" style={{ padding: 24 }}>
      <h1>Not Found</h1>
      <p>That page doesn’t exist. <a href="/">Go home</a>.</p>
    </div>
  );
}

// Optional: landing page variant if you don’t have Home.jsx
// (kept here harmlessly; Home import above will be used)
function Landing() {
  return (
    <div className="wrap" style={{ padding: 24 }}>
      <h2>Welcome to Pub Game</h2>
      <p>Scan a QR to play, or sign in to manage your pub’s games.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <a className="btn" href="/login">Sign in</a>
        <a className="btn ghost" href="/crack-the-safe">Crack the Safe (demo)</a>
        <a className="btn ghost" href="/whats-in-the-box">What’s in the Box (demo)</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home ?? <Landing />} />
        {/* If your Home component is guaranteed to exist, use: element={<Home />} */}
        <Route path="/login" element={<Login />} />
        <Route path="/enter/:pubId/:gameKey" element={<Enter />} />

        {/* Public demo play pages (leave open so QR/demo still works) */}
        <Route path="/crack-the-safe" element={<CrackTheSafe />} />
        <Route path="/whats-in-the-box" element={<WhatsInTheBox />} />

        {/* Auth required */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
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
        <Route
          path="/pricing"
          element={
            <PrivateRoute>
              <Pricing />
            </PrivateRoute>
          }
        />
        <Route
          path="/raffle"
          element={
            <PrivateRoute>
              <Raffle />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}