import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Import the pub theme ONCE for the whole app */
import "./ui/pubgame-theme.css";

/* Pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import CrackTheSafe from "./pages/CrackTheSafe";
import WhatsInTheBox from "./pages/WhatsInTheBox";
import Raffle from "./pages/Raffle";
import Enter from "./pages/Enter";

/* Simple auth helper */
const isAuthed = () => !!localStorage.getItem("token");
function Private({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <Private>
              <Dashboard />
            </Private>
          }
        />
        <Route
          path="/admin"
          element={
            <Private>
              <Admin />
            </Private>
          }
        />
        <Route
          path="/pricing"
          element={
            <Private>
              <Pricing />
            </Private>
          }
        />
        <Route
          path="/billing"
          element={
            <Private>
              <Billing />
            </Private>
          }
        />

        {/* Public player routes (QR-ready) */}
        <Route path="/enter/:pubId/:gameKey" element={<Enter />} />
        <Route path="/crack-the-safe" element={<CrackTheSafe />} />
        <Route path="/whats-in-the-box" element={<WhatsInTheBox />} />
        <Route path="/raffle" element={<Raffle />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}