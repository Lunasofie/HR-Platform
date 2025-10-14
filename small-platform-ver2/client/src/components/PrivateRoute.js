import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ token, children, requiredRole }){
  if (!token) return <Navigate to="/login" replace />;
  // quick decode of JWT to check role without verifying on client
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (requiredRole && payload.role !== requiredRole) return <Navigate to="/" replace />;
    return children;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}
