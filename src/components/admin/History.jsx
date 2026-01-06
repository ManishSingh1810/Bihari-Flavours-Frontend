import React, { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  Loader,
  Package,
  ArrowLeft,
} from "lucide-react";
import api from "../../api/axios";

/* ---------------- Status Map ---------------- */
const statusInfo = {
  Delivered: {
    icon: <CheckCircle className="h-5 w-5 text-[#1F7A3F]" />,
    color: "text-[#1F7A3F]",
    rowColor: "hover:bg-[#1F7A3F]/5",
  },
  Cancelled: {
    icon: <XCircle className="h-5 w-5 text-[#8E1B1B]" />,
    color: "text-[#8E1B1B]",
    rowColor: "hover:bg-[rgba(142,27,27,0.05)]",
  },
  Shipped: {
    icon: <Package className="h-5 w-5 text-[#1F4E79]" />,
    color: "text-[#1F4E79]",
    rowColor: "hover:bg-[#1F4E79]/5",
  },
};

/* ================= MODAL ================= */

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-lg
                   bg-[#FAF7F2]
                   border border-[rgba(142,27,27,0.25)]"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6F675E]"
        >
          <X size={20} />
        </button>

        <div className="border-b border-[rgba(142,27,27,0.25)] px-6 py-4">
          <h2 className="text-xl font-semibold text-[#1F1B16]">
            Order Details
          </h2>
          <p className="text-xs font-mono text-[#6F675E]">
            #{order.originalOrderId?.slice(-8)}
          </p>
        </div>

        <div className="space-y-6 p-6 text-sm max-h-[70vh] overflow-y-auto">
          {/* Order Info */}
          <div>
            <h3 className="font-semibold text-[#1F1B16] mb-2">
              Order Information
            </h3>
            <div className="space-y-2 rounded-md border
                            border-[rgba(142,27,27,0.25)] p-4">
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-medium ${statusInfo[order.orderStatus]?.color}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span>{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span>
                  {new Date(order.completedAt || order.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="font-semibold text-[#1F1B16] mb-2">
              Customer Details
            </h3>
            <div className="space-y-2 rounded-md border
                            border-[rgba(142,27,27,0.25)] p-4">
              <p className="flex items-center gap-2">
                <User size={14} /> {order.shippingAddress?.name}
              </p>
              <p className="text-[#6F675E]">
                Phone: {order.shippingAddress?.phone}
              </p>
              <p className="flex gap-2 text-[#6F675E]">
                <MapPin size={14} />
                {order.shippingAddress?.street},{" "}
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.postalCode}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-[#1F1B16] mb-2">
              Order Summary
            </h3>
            <div className="space-y-2 rounded-md border
                            border-[rgba(142,27,27,0.25)] p-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span className="text-[#8E1B1B]">
                  ₹{order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= PAGE ================= */

const AdminHistoryPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/admin/history");

      if (res.data.success) {
        setHistoryOrders(
          res.data.orders.filter(o =>
            ["delivered", "cancelled"].includes(o.orderStatus?.toLowerCase())
          )
        );
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch order history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#FAF7F2] px-6 py-14 pt-24">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => window.history.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#6F675E]"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-[#1F1B16]">
              Order History
            </h1>
            <button
              onClick={fetchOrderHistory}
              disabled={loading}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-[#8E1B1B]
                            bg-[rgba(142,27,27,0.05)] p-4 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border
                          border-[rgba(142,27,27,0.25)] bg-[#F3EFE8]">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader className="h-8 w-8 animate-spin text-[#8E1B1B]" />
              </div>
            ) : (
              <table className="min-w-full">
                <tbody>
                  {historyOrders.length ? (
                    historyOrders.map(order => {
                      const { icon, color, rowColor } =
                        statusInfo[order.orderStatus] || {};
                      return (
                        <tr
                          key={order.originalOrderId}
                          onClick={() => setSelectedOrder(order)}
                          className={`cursor-pointer ${rowColor}`}
                        >
                          <td className="px-6 py-4 font-mono text-[#6F675E]">
                            #{order.originalOrderId?.slice(-8)}
                          </td>
                          <td className="px-6 py-4">
                            {order.shippingAddress?.name}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(
                              order.completedAt || order.createdAt
                            ).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-6 py-4">
                            {order.paymentMethod}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 ${color}`}>
                              {icon} {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#8E1B1B]">
                            ₹{order.totalAmount?.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-[#6F675E]">
                        No completed or cancelled orders.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default AdminHistoryPage;
