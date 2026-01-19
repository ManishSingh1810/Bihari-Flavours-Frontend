import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Added for Navbar safety
import {
  Package,
  Truck,
  CheckCircle,
  X,
  User,
  MapPin,
  Loader,
  Calendar
} from 'lucide-react';
import api from '../../api/axios';
import { getDisplayOrderId, getInternalOrderId } from "../../utils/orderId";

/* ---------------- Status Map ---------------- */
const statusInfo = {
  Delivered: {
    icon: <CheckCircle className="h-5 w-5 text-[#1F7A3F]" />,
    color: 'text-[#1F7A3F]',
  },
  Shipped: {
    icon: <Truck className="h-5 w-5 text-[#1F4E79]" />,
    color: 'text-[#1F4E79]',
  },
  Pending: {
    icon: <Package className="h-5 w-5 text-[#8E1B1B]" />,
    color: 'text-[#8E1B1B]',
  },
  Processing: {
    icon: <Package className="h-5 w-5 text-[#8E1B1B]" />,
    color: 'text-[#8E1B1B]',
  },
};

/* ---------------- Order Details Modal ---------------- */
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  // Syncing with your OrderHistory Schema fields
  const shipping = order.shippingAddress || {};

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center
                 bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-xl shadow-2xl
                   bg-white border border-[rgba(142,27,27,0.18)] overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6F675E] hover:text-[#1F1B16] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="border-b border-[rgba(142,27,27,0.18)] px-6 py-5 bg-[#F8FAFC]">
          <h2 className="text-xl font-semibold text-[#1F1B16]">
            Order Summary
          </h2>
          <p className="text-xs text-[#6F675E] mt-1">
            Order ID: <span className="font-mono">#{getDisplayOrderId(order)}</span>
          </p>
          <p className="text-[11px] text-[#6F675E] mt-1">
            Internal: <span className="font-mono">{getInternalOrderId(order)}</span>
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto space-y-6 p-6 text-sm">

          {/* Payment & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 font-semibold text-[#1F1B16]">Payment</h3>
              <div className="rounded-md border border-[rgba(142,27,27,0.1)] bg-white p-3">
                <p className="text-[#6F675E] text-[11px] uppercase">Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
                <p className="text-[#6F675E] text-[11px] uppercase mt-2">Status</p>
                <p className="font-medium text-[#8E1B1B]">{order.paymentStatus}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[#1F1B16]">Order Status</h3>
              <div className="rounded-md border border-[rgba(142,27,27,0.1)] bg-white p-3">
                <p className="text-[#6F675E] text-[11px] uppercase">Current State</p>
                <p className="font-medium text-[#1F4E79]">{order.orderStatus}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h3 className="mb-2 font-semibold text-[#1F1B16]">Delivery Address</h3>
            <div className="rounded-md border border-[rgba(142,27,27,0.1)] bg-white p-4 space-y-2">
              <p className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-[#8E1B1B]" />
                {shipping.name}
              </p>
              <p className="flex items-start gap-2 text-[#6F675E]">
                <MapPin className="mt-1 h-4 w-4 shrink-0" />
                <span>
                  {shipping.street}, {shipping.city}, {shipping.state} - {shipping.postalCode}
                </span>
              </p>
              <p className="text-[#6F675E] ml-6">Phone: {shipping.phone}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="mb-2 font-semibold text-[#1F1B16]">Purchased Items</h3>
            <div className="space-y-3 rounded-md border border-[rgba(142,27,27,0.1)] bg-white p-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-[#1F1B16]">{item.name}</p>
                    <p className="text-xs text-[#6F675E]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-[#1F1B16]">₹{item.price * item.quantity}</span>
                </div>
              ))}

              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-bold text-base">
                <span>Total Paid</span>
                <span className="text-[#8E1B1B]">
                  ₹{order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

/* ---------------- Order Card ---------------- */
const OrderItem = ({ order, onSelect }) => {
  const { icon, color } = statusInfo[order.orderStatus] || statusInfo.Pending;
  
  // Using completedAt from your Schema
  const displayDate = order.completedAt || order.createdAt;

  return (
    <button
      onClick={() => onSelect(order)}
      className="w-full rounded-lg border border-[rgba(142,27,27,0.15)]
                 bg-white p-5 text-left transition shadow-sm
                 hover:bg-white hover:border-[#8E1B1B] group"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-3 bg-white rounded-lg border border-[rgba(142,27,27,0.1)] group-hover:bg-[#F8FAFC]">
             <Calendar className="h-5 w-5 text-[#8E1B1B]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#6F675E]">
              Order Date
            </p>
            <p className="font-bold text-[#1F1B16]">
              {new Date(displayDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#6F675E]">Amount</p>
          <p className="text-lg font-bold text-[#8E1B1B]">
            ₹{order.totalAmount?.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-between items-center border-t border-[rgba(142,27,27,0.1)] pt-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`text-sm font-bold uppercase tracking-tight ${color}`}>
            {order.orderStatus}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#6F675E] font-medium">
          <span>{order.items?.length} Items</span>
          <span>•</span>
          <span className="text-[#8E1B1B] group-hover:underline">View Details</span>
        </div>
      </div>
    </button>
  );
};

/* ---------------- Main Page ---------------- */
const Order = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Active orders (pending/shipped/etc.)
      const activeRes = await api.get('/orders/my-orders');
      const activeOrders = activeRes?.data?.success ? (activeRes.data.orders || []) : [];

      // Some backends move Delivered/Cancelled to a history endpoint.
      // Try a few common paths silently (no global toast if missing).
      const historyPaths = [
        "/orders/my-orders/history",
        "/orders/my-history",
        "/orders/my-orders?includeDelivered=true",
      ];

      const historyResults = [];
      for (const path of historyPaths) {
        try {
          const r = await api.get(path, { skipErrorToast: true });
          if (r?.data?.success && Array.isArray(r.data.orders)) {
            historyResults.push(...r.data.orders);
            break; // stop after first working endpoint
          }
        } catch {
          // ignore
        }
      }

      const merged = [...activeOrders, ...historyResults];
      const dedup = new Map();
      for (const o of merged) {
        const key = String(o?._id || o?.originalOrderId || getInternalOrderId(o) || Math.random());
        if (!dedup.has(key)) dedup.set(key, o);
      }

      const sorted = Array.from(dedup.values()).sort((a, b) => {
        const ad = new Date(a?.completedAt || a?.createdAt || 0).getTime();
        const bd = new Date(b?.completedAt || b?.createdAt || 0).getTime();
        return bd - ad;
      });

      if (activeRes?.data?.success) {
        setOrders(sorted);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-14 pt-24">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#1F1B16]">Order History</h1>
          <p className="text-[#6F675E] text-sm mt-2">Track and manage your past orders</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="h-10 w-10 animate-spin text-[#8E1B1B]" />
            <p className="text-sm text-[#6F675E] mt-4">Fetching your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
             <p className="text-red-600">{error}</p>
             <button onClick={fetchOrders} className="mt-4 text-sm font-bold text-[#8E1B1B] underline">Try Again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-[rgba(142,27,27,0.1)]">
            <Package className="mx-auto mb-4 h-20 w-20 text-[#8E1B1B] opacity-20" />
            <p className="text-lg font-medium text-[#1F1B16]">No orders found</p>
            <p className="text-sm text-[#6F675E]">Once you make a purchase, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderItem
                key={order._id}
                order={order}
                onSelect={setSelectedOrder}
              />
            ))}
          </div>
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default Order;