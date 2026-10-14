import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Skeleton } from './common/Skeleton.jsx';

export const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};
