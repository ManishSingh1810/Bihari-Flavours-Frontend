import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../Context/userContext";

const AdminRoute = () => {
  const { user } = useUser();

  // If no user is logged in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If logged-in user is not admin, redirect to user home
  if (user.role !== "admin") return <Navigate to="/" replace />;

  // If admin, render the admin routes
  return <Outlet />;
};

export default AdminRoute;
