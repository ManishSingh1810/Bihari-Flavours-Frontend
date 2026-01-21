import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  X,
  Loader,
} from 'lucide-react';
import Checkout from './checkout';
import { useUser } from "../../Context/userContext";

/* ---------------- Logout Helper ---------------- */
const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/* ---------------- Confirmation Modal ---------------- */
const CustomModal = ({ isOpen, message, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center
                 bg-black/50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl
                   bg-white
                   border border-[rgba(142,27,27,0.18)]
                   p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#1F1B16]">Confirm action</h4>
          <button onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <p className="mb-6 text-sm text-[#6F675E]">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-[#8E1B1B] px-4 py-2 text-sm font-semibold text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ---------------- Cart Page ---------------- */
const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const { cart, refreshCart, setCartQuantity, clearCart: clearCartGlobal } = useUser();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    refreshCart()
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Update Quantity ---------------- */
  const updateCartQuantity = async (productId, quantity) => {
    try {
      setUpdating(true);
      const res = await setCartQuantity(productId, quantity);
      if (!res?.success) throw new Error("Failed to update cart");
    } catch (err) {
      if ([401, 403].includes(err?.response?.status)) {
        logoutUser();
        return;
      }
      setError('Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };

  const removeFromCart = (productId) =>
    updateCartQuantity(productId, 0);

  /* ---------------- Clear Cart ---------------- */
  const clearCart = async () => {
    try {
      setUpdating(true);
      await clearCartGlobal();
      setShowClearModal(false);
    } catch (err) {
      if ([401, 403].includes(err?.response?.status)) {
        logoutUser();
        return;
      }
      setError('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="relative z-0 flex min-h-screen items-center justify-center
                      bg-[#F8FAFC] pt-24">
        <Loader className="h-8 w-8 animate-spin text-[#8E1B1B]" />
      </div>
    );
  }

  /* ---------------- Page ---------------- */
  return (
    <div className="relative z-0 min-h-screen bg-[#F8FAFC] px-6 py-14 pt-24">
      <CustomModal
        isOpen={showClearModal}
        message="Are you sure you want to clear your cart?"
        onConfirm={clearCart}
        onClose={() => setShowClearModal(false)}
      />

      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#6F675E]"
        >
          <ArrowLeft /> Back to shop
        </button>

        <div className="rounded-xl border border-[rgba(142,27,27,0.18)] bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#1F1B16]">
              <ShoppingCart /> Shopping Cart
            </h1>

            {cart?.cartItems?.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                disabled={updating}
                className="text-sm text-[#8E1B1B]"
              >
                Clear cart
              </button>
            )}
          </div>

          {!cart || cart.cartItems.length === 0 ? (
            <p className="py-20 text-center text-sm text-[#6F675E]">
              Your cart is empty
            </p>
          ) : (
            <>
              {cart.cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="mb-3 flex items-center gap-4
                             rounded-md border border-[rgba(142,27,27,0.25)]
                             bg-[#F8FAFC] p-4"
                >
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />

                  <div className="grow">
                    <p className="font-medium text-[#1F1B16]">
                      {item.name}
                    </p>
                    <p className="text-sm text-[#6F675E] tabular-nums">
                      Rs. {item.price}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      updateCartQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={updating}
                  >
                    <Minus />
                  </button>

                  <span className="px-2 text-sm">{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateCartQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={updating}
                  >
                    <Plus />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    disabled={updating}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setShowCheckout(true)}
                className="mt-6 w-full rounded-md
                           border border-[#8E1B1B]
                           px-6 py-3 text-sm font-medium
                           text-[#8E1B1B]"
              >
                Proceed to checkout
              </button>
            </>
          )}
        </div>
      </div>

      {showCheckout && (
        <Checkout
          cart={cart}
          setShowCheckout={setShowCheckout}
        />
      )}
    </div>
  );
};

export default Cart;
