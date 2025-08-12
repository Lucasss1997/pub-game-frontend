// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../lib/auth';

export default function PrivateRoute() {
  const authed = isLoggedIn();
  const loc = useLocation();
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <Outlet />;
}