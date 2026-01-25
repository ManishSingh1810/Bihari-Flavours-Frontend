import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./Context/userContext";

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
import CombosPage from "./components/user/Combos.jsx";

// ✅ New pages
import PrivacyPolicy from "./components/user/PrivacyPolicy";
import Terms from "./components/user/Terms";
import ShippingPolicy from "./components/user/ShippingPolicy";
import ReturnsPolicy from "./components/user/ReturnsPolicy";

// Admin Pages
import AdminDashboard from "./components/admin/Dashboard";
import AdminOrder from "./components/admin/Order";
import History from "./components/admin/History";
import ProductManager from "./components/admin/ProductManager";
import CouponManager from "./components/admin/CouponManager";
import HomepageManager from "./components/admin/HomepageManager";
import ReorderProducts from "./components/admin/ReorderProducts.jsx";

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
        <Route path="combos" element={<CombosPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="order" element={<Order />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
   


        {/* ✅ Legal pages */}
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="shipping" element={<ShippingPolicy />} />
        <Route path="returns" element={<ReturnsPolicy />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="order" element={<AdminOrder />} />
          <Route path="history" element={<History />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="reorder-products" element={<ReorderProducts />} />
          <Route path="coupons" element={<CouponManager />} />
          <Route path="homepage" element={<HomepageManager />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
