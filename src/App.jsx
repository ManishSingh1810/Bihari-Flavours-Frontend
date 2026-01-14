import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./Context/userContext";
import Account from "./components/user/Account";

// Auth & Route Protection
import Login from "./auth/Login";
import AdminRoute from "./auth/AdminRoute";

// Layouts
import UserLayout from "./layout/UserLayout";
import AdminLayout from "./layout/AdminLayout";

// User Pages
import UserDashboard from "./components/user/Dashboard";
import Product from "./components/user/Product";
import Cart from "./components/user/Cart";
import Order from "./components/user/Order";
import ProductDetailsPage from "./components/user/ProductDetailsPage";

// ✅ New pages
import PrivacyPolicy from "./components/user/PrivacyPolicy";
import Terms from "./components/user/Terms";

// Admin Pages
import AdminDashboard from "./components/admin/Dashboard";
import AdminOrder from "./components/admin/Order";
import History from "./components/admin/History";
import ProductManager from "./components/admin/ProductManager";
import CouponManager from "./components/admin/CouponManager";

const App = () => {
  const { user } = useUser();

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Login />
          )
        }
      />

      {/* User Routes */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="product" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="order" element={<Order />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>}
/>


        {/* ✅ Legal pages */}
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<Terms />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="order" element={<AdminOrder />} />
          <Route path="history" element={<History />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="coupons" element={<CouponManager />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
