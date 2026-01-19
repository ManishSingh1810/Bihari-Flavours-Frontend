export function getDisplayOrderId(order) {
  if (!order) return "";

  // Prefer a backend-provided human-friendly id if available
  const preferredKeys = [
    "displayOrderId",
    "orderId",
    "orderNumber",
    "publicOrderId",
    "shortOrderId",
    "shortId",
    "orderCode",
  ];

  for (const k of preferredKeys) {
    const v = order?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }

  // Admin history sometimes stores original order id separately
  const original = order?.originalOrderId;
  if (typeof original === "string" && original.trim()) {
    return original.trim().slice(-8);
  }

  const id = order?._id;
  if (typeof id === "string" && id.trim()) return id.trim().slice(-8);

  return "";
}

export function getInternalOrderId(order) {
  if (!order) return "";
  if (typeof order?._id === "string") return order._id;
  if (typeof order?.originalOrderId === "string") return order.originalOrderId;
  return "";
}

