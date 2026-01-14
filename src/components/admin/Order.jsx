import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  XCircle,
  ArrowLeft,
  CheckCircle,
  X,
  User,
  MapPin,
  Phone,
} from "lucide-react";
import api from "../../api/axios";

/* ---------------- Status Map ---------------- */
const statusInfo = {
  Shipped: {
    icon: <Truck className="h-5 w-5 text-[#1F4E79]" />,
    color: "text-[#1F4E79]",
    rowColor: "hover:bg-[#1F4E79]/5",
  },
  Pending: {
    icon: <Package className="h-5 w-5 text-[#8E1B1B]" />,
    color: "text-[#8E1B1B]",
    rowColor: "hover:bg-[rgba(142,27,27,0.05)]",
  },
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
};

/* ---------------- Confirmation Modal ---------------- */
const ConfirmationModal = ({ statusToConfirm, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-lg bg-[#FAF7F2]
                    border border-[rgba(142,27,27,0.25)] p-6">
      <h3 className="text-lg font-semibold text-[#1F1B16]">
        Confirm status change
      </h3>

      <p className="mt-3 text-sm text-[#6F675E]">
        Change order status to <strong>{statusToConfirm}</strong>?
      </p>

      {statusToConfirm === "Cancelled" && (
        <p className="mt-2 text-xs text-[#8E1B1B]">
          This action cannot be undone.
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Go back
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

/* ---------------- Order Detail Modal ---------------- */
const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  if (!order) return null;
  const shipping = order.shippingAddress || {};

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-lg bg-[#FAF7F2]
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
          <p className="text-xs text-[#6F675E] font-mono">
            #{order._id.slice(-8)}
          </p>
        </div>

        <div className="space-y-6 p-6 text-sm">
          <div>
            <h3 className="font-semibold text-[#1F1B16] mb-2">
              Order Information
            </h3>
            <div className="space-y-2 rounded-md border
                            border-[rgba(142,27,27,0.25)] p-4">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-medium">{order.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#1F1B16] mb-2">
              Shipping
            </h3>
            <div className="space-y-2 rounded-md border
                            border-[rgba(142,27,27,0.25)] p-4">
              <p className="flex items-center gap-2">
                <User size={14} /> {shipping.name}
              </p>
              {/* ✅ Phone */}
{shipping.phone && (
  <p className="flex items-center gap-2 text-[#6F675E]">
    <Phone size={14} />
    <a
      href={`tel:${shipping.phone}`}
      className="underline"
      onClick={(e) => e.stopPropagation()}
    >
      {shipping.phone}
    </a>
  </p>
)}

              <p className="flex items-start gap-2 text-[#6F675E]">
                <MapPin size={14} />
                {shipping.street}, {shipping.city}, {shipping.state}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#1F1B16] mb-2">
              Items
            </h3>
            <div className="space-y-2 rounded-md border
                            border-[rgba(142,27,27,0.25)] p-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span className="text-[#8E1B1B]">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {order.orderStatus === "Pending" && (
              <button
                onClick={() => onStatusUpdate(order._id, "Shipped")}
                className="flex-1 rounded-md border
                           border-[#1F4E79] py-2 text-sm text-[#1F4E79]"
              >
                Ship
              </button>
            )}
            {order.orderStatus === "Shipped" && (
              <button
                onClick={() => onStatusUpdate(order._id, "Delivered")}
                className="flex-1 rounded-md border
                           border-[#1F7A3F] py-2 text-sm text-[#1F7A3F]"
              >
                Deliver
              </button>
            )}
            <button
              onClick={() => onStatusUpdate(order._id, "Cancelled")}
              className="flex-1 rounded-md border
                         border-[#8E1B1B] py-2 text-sm text-[#8E1B1B]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN PAGE ---------------- */
const AdminPendingOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await api.get("/orders/admin/orders");
    if (res.data.success) setOrders(res.data.orders);
  };

  const handleStatusUpdate = (id, status) =>
    setConfirmation({ id, status });

  const confirmUpdate = async () => {
    await api.patch(`/orders/admin/orders/${confirmation.id}`, {
      orderStatus: confirmation.status,
    });
    setConfirmation(null);
    fetchOrders();
    setSelectedOrder(null);
  };

  return (
    <>
      {confirmation && (
        <ConfirmationModal
          statusToConfirm={confirmation.status}
          onConfirm={confirmUpdate}
          onCancel={() => setConfirmation(null)}
        />
      )}

      <div className="min-h-screen bg-[#FAF7F2] px-6 py-14 pt-24">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => window.history.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#6F675E]"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="mb-6 text-3xl font-semibold text-[#1F1B16]">
            Pending Orders
          </h1>

          <div className="overflow-hidden rounded-lg border
                          border-[rgba(142,27,27,0.25)] bg-[#F3EFE8]">
            <table className="min-w-full">
              <tbody>
                {orders.map((order) => {
                  const { icon, color, rowColor } =
                    statusInfo[order.orderStatus] || {};
                  return (
                    <tr
                      key={order._id}
                      className={`${rowColor} cursor-pointer`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 font-mono text-[#6F675E]">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4">{order.shippingAddress?.name}</td>
                      <td className="px-6 py-4">{order.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 ${color}`}>
                          {icon} {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[#8E1B1B]">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default AdminPendingOrdersPage;

