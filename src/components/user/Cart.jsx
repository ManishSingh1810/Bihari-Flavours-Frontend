import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  X,
  Loader,
} from 'lucide-react';
import api from '../../api/axios';
import Checkout from './checkout';

/* ---------------- Logout Helper ---------------- */
const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/* ---------------- Confirmation Modal ---------------- */
const CustomModal = ({ isOpen, message, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg
                   bg-[#FAF7F2]
                   border border-[rgba(142,27,27,0.25)]
                   p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#1F1B16]">
            Confirm action
          </h4>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <p className="mb-6 text-sm text-[#6F675E]">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md border border-[#8E1B1B]
                       px-4 py-2 text-sm text-[#8E1B1B]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Cart Page ---------------- */
const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  /* ---------------- Fetch Cart ---------------- */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
        setError(null);
      } else {
        setError(res.data.message || 'Failed to fetch cart');
      }
    } catch (err) {
      if ([401, 403].includes(err?.response?.status)) {
        logoutUser();
        return;
      }
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Update Quantity ---------------- */
  const updateCartQuantity = async (productId, quantity) => {
    try {
      setUpdating(true);
      const res = await api.put('/cart', { productId, quantity });
      if (res.data.success) setCart(res.data.cart);
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
      await api.delete('/cart');
      setCart({ cartItems: [], totalAmount: 0 });
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
                      bg-[#FAF7F2] pt-24">
        <Loader className="h-8 w-8 animate-spin text-[#8E1B1B]" />
      </div>
    );
  }

  /* ---------------- Page ---------------- */
  return (
    <div className="relative z-0 min-h-screen bg-[#FAF7F2] px-6 py-14 pt-24">
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

        <div className="rounded-lg border border-[rgba(142,27,27,0.25)] bg-[#F3EFE8] p-6">
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
                             bg-[#FAF7F2] p-4"
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
                    <p className="text-sm text-[#6F675E]">
                      ₹{item.price}
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
          setCart={setCart}
          setShowCheckout={setShowCheckout}
        />
      )}
    </div>
  );
};

export default Cart;
