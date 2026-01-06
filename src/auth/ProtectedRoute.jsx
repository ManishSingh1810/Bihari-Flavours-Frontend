import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../Context/userContext";

const ProtectedRoute = ({ allowedRole }) => {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
