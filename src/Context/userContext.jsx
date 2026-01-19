import React, { createContext, useCallback, useMemo, useState, useContext, useEffect } from "react";
import api from "../api/axios";

const UserContext = createContext();

function computeCartItemCount(cart) {
  const items = cart?.cartItems || [];
  return items.reduce((sum, it) => sum + (Number(it?.quantity) || 0), 0);
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // =====================
  // Global Cart State
  // =====================
  const [cart, setCart] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  // =====================
  // Load user on refresh
  // =====================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const applyCartResponse = useCallback((data) => {
    // Backend is expected to return:
    // - cartItemCount
    // - cart.cartItems
    const nextCart = data?.cart ?? null;
    const nextCount =
      typeof data?.cartItemCount === "number"
        ? data.cartItemCount
        : typeof data?.cart?.cartItemCount === "number"
          ? data.cart.cartItemCount
          : nextCart
            ? computeCartItemCount(nextCart)
            : 0;

    if (nextCart) setCart(nextCart);
    setCartItemCount(nextCount);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setCartItemCount(0);
      return;
    }
    try {
      const res = await api.get("/cart");
      if (res.data?.success) applyCartResponse(res.data);
    } catch {
      // ignore; global axios interceptor will toast errors as needed
    }
  }, [applyCartResponse, user]);

  const addToCart = useCallback(
    async (productId) => {
      const res = await api.post("/cart", { productId });
      if (res.data?.success) applyCartResponse(res.data);
      return res.data;
    },
    [applyCartResponse]
  );

  const setCartQuantity = useCallback(
    async (productId, quantity) => {
      const res = await api.put("/cart", { productId, quantity });
      if (res.data?.success) applyCartResponse(res.data);
      return res.data;
    },
    [applyCartResponse]
  );

  const clearCart = useCallback(async () => {
    const res = await api.delete("/cart");
    if (res?.data?.success) {
      applyCartResponse(res.data);
      return res.data;
    }
    // fallback if backend returns no body
    setCart({ cartItems: [], totalAmount: 0 });
    setCartItemCount(0);
    return res?.data;
  }, [applyCartResponse]);

  // =====================
  // Login
  // =====================
  const login = (userData) => {
    /**
     * Backend sends:
     * - user object always
     * - token only in dev / HTTP
     */

    const userObj = {
      name: userData.name || "",
      phone: userData.phone || "",
      role: userData.role || "user",
      userId: userData.userId || userData.id,
    };

    // Save user (for UI state)
    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);

    // Save token ONLY if backend sends it (dev / HTTP)
    if (userData.token) {
      localStorage.setItem("authToken", userData.token);
    }

    console.log("User logged in:", userObj);
  };

  // =====================
  // Logout
  // =====================
  const logout = async () => {
  try {
    // Preferred + aliases (backend supports these)
    const endpoints = ["/users/logout", "/logout", "/admin/logout"];
    let lastErr = null;
    for (const ep of endpoints) {
      try {
        await api.post(ep);
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (lastErr) throw lastErr;
  } catch (e) {
    // Even if API fails, still clear local state
    console.log("Backend logout failed:", e?.response?.data || e.message);
  } finally {
    setUser(null);
    setCart(null);
    setCartItemCount(0);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  }
};
  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("authToken");
  // };

  // refresh cart whenever user changes (login/logout/refresh)
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartItemsByProductId = useMemo(() => {
    const map = new Map();
    for (const it of cart?.cartItems || []) {
      map.set(String(it.productId), Number(it.quantity) || 0);
    }
    return map;
  }, [cart]);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",

        // cart
        cart,
        cartItemCount,
        cartItemsByProductId,
        refreshCart,
        addToCart,
        setCartQuantity,
        clearCart,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);




