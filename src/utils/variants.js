export function getDefaultVariant(variants) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!list.length) return null;
  return list.find((v) => v?.isDefault) || list[0];
}

export function getVariantByLabel(variants, label) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  const key = String(label || "").trim();
  if (!key) return null;
  return list.find((v) => String(v?.label || "").trim() === key) || null;
}

export function getDisplayPrice(product) {
  // Prefer backend-computed combo price when available
  if (product?.computedComboPrice != null && product?.computedComboPrice !== "") {
    return Number(product.computedComboPrice ?? 0);
  }
  if (String(product?.productType || "").toLowerCase() === "combo") {
    // fallback: combo may still have a base price field
    return Number(product?.price ?? 0);
  }
  const variants = product?.variants;
  if (Array.isArray(variants) && variants.length) {
    const def = getDefaultVariant(variants);
    const price = def?.price ?? variants[0]?.price;
    return Number(price ?? 0);
  }
  return Number(product?.price ?? 0);
}

export function getDisplayMRP(product) {
  // For combo products
  if (product?.computedComboPrice != null && product?.computedComboPrice !== "") {
    return Number(product?.computedComboMRP ?? 0);
  }
  if (String(product?.productType || "").toLowerCase() === "combo") {
    return Number(product?.mrp ?? 0);
  }
  // For variant products
  const variants = product?.variants;
  if (Array.isArray(variants) && variants.length) {
    const def = getDefaultVariant(variants);
    const mrp = def?.mrp ?? variants[0]?.mrp;
    return Number(mrp ?? 0);
  }
  // For regular products
  return Number(product?.mrp ?? 0);
}

export function getVariantPrice(variant) {
  return Number(variant?.price ?? 0);
}

export function getVariantMRP(variant) {
  return Number(variant?.mrp ?? 0);
}

export function calculateDiscount(mrp, price) {
  const m = Number(mrp ?? 0);
  const p = Number(price ?? 0);
  if (m <= 0 || p <= 0 || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}

export function getDefaultVariantLabel(product) {
  const variants = product?.variants;
  if (!Array.isArray(variants) || !variants.length) return "";
  return String(getDefaultVariant(variants)?.label || variants[0]?.label || "").trim();
}


