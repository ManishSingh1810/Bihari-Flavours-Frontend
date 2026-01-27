import React, { createContext, useCallback, useMemo, useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { getDisplayPrice, getDefaultVariantLabel } from "../utils/variants.js";

const UserContext = createContext();

const GUEST_CART_KEY = "guestCart:v2";
const LEGACY_GUEST_CART_KEY = "guestCart:v1";

function cartKey(productId, variantLabel) {
  return `${String(productId)}::${String(variantLabel || "")}`;
}

function computeCartItemCount(cart) {
  const items = cart?.cartItems || [];
  return items.reduce((sum, it) => sum + (Number(it?.quantity) || 0), 0);
}

function computeCartTotal(cart) {
  const items = cart?.cartItems || [];
  return items.reduce((sum, it) => sum + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0);
}

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.cartItems)) {
        const next = {
          cartItems: parsed.cartItems.filter(Boolean).map((it) => ({
            ...it,
            variantLabel: String(it?.variantLabel || ""),
          })),
          totalAmount: typeof parsed.totalAmount === "number" ? parsed.totalAmount : computeCartTotal(parsed),
        };
        return next;
      }
    }

    // migrate legacy v1 -> v2 (no variants)
    const legacyRaw = localStorage.getItem(LEGACY_GUEST_CART_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy && Array.isArray(legacy.cartItems)) {
        const migrated = {
          cartItems: legacy.cartItems.filter(Boolean).map((it) => ({
            ...it,
            variantLabel: "",
          })),
          totalAmount: typeof legacy.totalAmount === "number" ? legacy.totalAmount : computeCartTotal(legacy),
        };
        writeGuestCart(migrated);
        try {
          localStorage.removeItem(LEGACY_GUEST_CART_KEY);
        } catch {
          // ignore
        }
        return migrated;
      }
    }

    return { cartItems: [], totalAmount: 0 };
  } catch {
    return { cartItems: [], totalAmount: 0 };
  }
}

function writeGuestCart(cart) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
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

  const applyCartResponse = useCallback(async (data) => {
    // Backend is expected to return:
    // - cartItemCount
    // - cart.cartItems
    let nextCart = data?.cart ?? null;
    const nextCount =
      typeof data?.cartItemCount === "number"
        ? data.cartItemCount
        : typeof data?.cart?.cartItemCount === "number"
          ? data.cart.cartItemCount
          : nextCart
            ? computeCartItemCount(nextCart)
            : 0;

    // ⚠️ Workaround: Backend might not return product images (photo field)
    // If any cart items are missing images, fetch them from the products API
    if (nextCart?.cartItems?.length) {
      const itemsWithoutImages = nextCart.cartItems.filter(item => !item.photo && !item.image);
      
      if (itemsWithoutImages.length > 0) {
        const enrichedItems = await Promise.all(
          nextCart.cartItems.map(async (item) => {
            if (item.photo || item.image) return item; // Already has image
            
            try {
              const res = await api.get(`/products/${item.productId}`, { skipErrorToast: true });
              if (res?.data?.success) {
                const product = res.data.product;
                return {
                  ...item,
                  photo: product?.photos?.[0] || product?.photo || "",
                  name: item.name || product?.name || "Product",
                };
              }
            } catch {
              // If fetch fails, return item as-is
            }
            return item;
          })
        );
        
        nextCart = { ...nextCart, cartItems: enrichedItems };
      }
    }

    if (nextCart) setCart(nextCart);
    setCartItemCount(nextCount);
  }, []);

  const applyGuestCart = useCallback((guestCart) => {
    const nextCart = guestCart || { cartItems: [], totalAmount: 0 };
    setCart(nextCart);
    setCartItemCount(computeCartItemCount(nextCart));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      // Guest cart (stored locally)
      applyGuestCart(readGuestCart());
      return;
    }
    try {
      const res = await api.get("/cart");
      if (res.data?.success) await applyCartResponse(res.data);
    } catch {
      // ignore; global axios interceptor will toast errors as needed
    }
  }, [applyCartResponse, applyGuestCart, user]);

  const addToCart = useCallback(
    async (productId, variantLabel = "") => {
      if (!user) {
        // Guest cart: fetch product info publicly, then store locally
        const guest = readGuestCart();
        const vLabel = String(variantLabel || "");
        const idx = guest.cartItems.findIndex(
          (it) => String(it.productId) === String(productId) && String(it.variantLabel || "") === vLabel
        );

        let product = null;
        try {
          const pRes = await api.get(`/products/${productId}`, { skipErrorToast: true });
          if (pRes?.data?.success) product = pRes.data.product;
        } catch {
          // ignore; we can still increment qty with minimal data
        }

        // If product has variants and no label provided, choose default
        let finalLabel = vLabel;
        if (product?.variants && Array.isArray(product.variants) && product.variants.length) {
          if (!finalLabel) {
            const def = product.variants.find((v) => v?.isDefault) || product.variants[0];
            finalLabel = String(def?.label || "");
          }
        }

        // Determine price: combo computed price > variants > base price
        let price = Number(getDisplayPrice(product) || guest.cartItems[idx]?.price || 0);
        if (product?.variants && Array.isArray(product.variants) && product.variants.length) {
          if (!finalLabel) finalLabel = getDefaultVariantLabel(product);
          const match = product.variants.find((v) => String(v?.label || "") === String(finalLabel));
          if (match && match.price != null) price = Number(match.price);
        }

        const base = {
          productId: String(productId),
          variantLabel: String(finalLabel || ""),
          name: product?.name || guest.cartItems[idx]?.name || "Product",
          photo: product?.photos?.[0] || product?.photo || guest.cartItems[idx]?.photo || "",
          price,
        };

        if (idx >= 0) {
          guest.cartItems[idx] = {
            ...guest.cartItems[idx],
            ...base,
            quantity: (Number(guest.cartItems[idx]?.quantity) || 0) + 1,
          };
        } else {
          guest.cartItems.push({ ...base, quantity: 1 });
        }

        guest.totalAmount = computeCartTotal(guest);
        writeGuestCart(guest);
        applyGuestCart(guest);
        return { success: true, cart: guest, cartItemCount: computeCartItemCount(guest), isGuest: true };
      }

        const res = await api.post("/cart", { productId, variantLabel: String(variantLabel || "") });
      if (res.data?.success) await applyCartResponse(res.data);
      return res.data;
    },
    [applyCartResponse, applyGuestCart, user]
  );

  const setCartQuantity = useCallback(
    async (productId, variantLabelOrQuantity, maybeQuantity) => {
      // Backward compatible: setCartQuantity(productId, quantity)
      // New: setCartQuantity(productId, variantLabel, quantity)
      const variantLabel =
        typeof variantLabelOrQuantity === "string" ? variantLabelOrQuantity : "";
      const quantity =
        typeof variantLabelOrQuantity === "string" ? maybeQuantity : variantLabelOrQuantity;

      if (!user) {
        const guest = readGuestCart();
        const vLabel = String(variantLabel || "");
        const idx = guest.cartItems.findIndex(
          (it) => String(it.productId) === String(productId) && String(it.variantLabel || "") === vLabel
        );
        const q = Math.max(0, Number(quantity) || 0);

        if (idx >= 0) {
          if (q === 0) guest.cartItems.splice(idx, 1);
          else guest.cartItems[idx] = { ...guest.cartItems[idx], quantity: q };
        } else if (q > 0) {
          // if user sets qty without existing item, try to fetch minimal info
          let product = null;
          try {
            const pRes = await api.get(`/products/${productId}`, { skipErrorToast: true });
            if (pRes?.data?.success) product = pRes.data.product;
          } catch {
            // ignore
          }

          let finalLabel = vLabel;
          if (product?.variants && Array.isArray(product.variants) && product.variants.length) {
            if (!finalLabel) {
              const def = product.variants.find((v) => v?.isDefault) || product.variants[0];
              finalLabel = String(def?.label || "");
            }
          }

          let price = Number(product?.price || 0);
          if (product?.variants && Array.isArray(product.variants) && product.variants.length && finalLabel) {
            const match = product.variants.find((v) => String(v?.label || "") === String(finalLabel));
            if (match && match.price != null) price = Number(match.price);
          }

          guest.cartItems.push({
            productId: String(productId),
            variantLabel: String(finalLabel || ""),
            name: product?.name || "Product",
            photo: product?.photos?.[0] || product?.photo || "",
            price,
            quantity: q,
          });
        }

        guest.totalAmount = computeCartTotal(guest);
        writeGuestCart(guest);
        applyGuestCart(guest);
        return { success: true, cart: guest, cartItemCount: computeCartItemCount(guest), isGuest: true };
      }

      const res = await api.put("/cart", {
        productId,
        variantLabel: String(variantLabel || ""),
        quantity,
      });
      if (res.data?.success) await applyCartResponse(res.data);
      return res.data;
    },
    [applyCartResponse, applyGuestCart, user]
  );

  const clearCart = useCallback(async () => {
    if (!user) {
      const empty = { cartItems: [], totalAmount: 0 };
      writeGuestCart(empty);
      applyGuestCart(empty);
      return { success: true, cart: empty, cartItemCount: 0, isGuest: true };
    }
    const res = await api.delete("/cart");
    if (res?.data?.success) {
      await applyCartResponse(res.data);
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

  const syncGuestCartToBackend = useCallback(async () => {
    if (!user) return;
    const guest = readGuestCart();
    if (!guest?.cartItems?.length) return;

    try {
      for (const it of guest.cartItems) {
        const pid = it?.productId;
        const q = Number(it?.quantity) || 0;
        const vLabel = String(it?.variantLabel || "");
        if (!pid || q <= 0) continue;
        // eslint-disable-next-line no-await-in-loop
        await api.put(
          "/cart",
          { productId: pid, variantLabel: vLabel, quantity: q },
          { skipErrorToast: true }
        );
      }
      writeGuestCart({ cartItems: [], totalAmount: 0 });
      await refreshCart();
    } catch {
      // if sync fails, keep guest cart to retry later
    }
  }, [refreshCart, user]);

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

  // When user logs in, merge guest cart into backend cart
  useEffect(() => {
    if (!user) return;
    syncGuestCartToBackend();
  }, [syncGuestCartToBackend, user]);

  const cartItemsByProductId = useMemo(() => {
    const map = new Map();
    for (const it of cart?.cartItems || []) {
      map.set(cartKey(it.productId, it.variantLabel), Number(it.quantity) || 0);
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




