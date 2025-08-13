// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./ui/pubgame-theme.css";

// Pages
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

// Very simple auth check (works with either a token or a flag)
const isAuthed = () => {
  try {
    return Boolean(
      localStorage.getItem("token") || localStorage.getItem("authed")
    );
  } catch {
    return false;
  }
};

// Guarded route wrapper
function PrivateRoute({ children }) {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

// Tiny 404 fallback
function NotFound() {
  return (
    <div className="wrap" style={{ padding: 24 }}>
      <h1>Not Found</h1>
      <p>
        <a href="/">Go home</a>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/enter/:pubId/:gameKey" element={<Enter />} />
        <Route path="/crack-the-safe" element={<CrackTheSafe />} />
        <Route path="/whats-in-the-box" element={<WhatsInTheBox />} />

        {/* Authed */}
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

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}