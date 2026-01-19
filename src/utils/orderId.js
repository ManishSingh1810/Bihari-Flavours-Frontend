export function getDisplayOrderId(order) {
  if (!order) return "";

  // Per requirements: always display order.orderId from API response.
  const v = order?.orderId;
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

export function getInternalOrderId(order) {
  if (!order) return "";
  if (typeof order?._id === "string") return order._id;
  return "";
}

