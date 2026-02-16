/**
 * Get the default variant from a list of variants
 * Priority: isDefault flag > first variant
 */
export function getDefaultVariant(variants) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!list.length) return null;
  return list.find((v) => v?.isDefault) || list[0];
}


/**
 * Find a specific variant by its label
 * Returns null if label is empty or variant not found
 */
export function getVariantByLabel(variants, label) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  const key = String(label || "").trim();
  if (!key) return null;
  return list.find((v) => String(v?.label || "").trim() === key) || null;
}

/**
 * Get the display price for a product
 * Handles combo products, variant products, and regular products
 * Priority: computedComboPrice > combo base price > variant price > product price
 */
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
  // Regular product with single price
  return Number(product?.price ?? 0);
}

/**
 * Get the MRP (Maximum Retail Price) for display
 * Handles combo products, variant products, and regular products
 * Returns 0 if MRP is not set
 */
export function getDisplayMRP(product) {
  // For combo products - use computed MRP if available
  if (product?.computedComboPrice != null && product?.computedComboPrice !== "") {
    return Number(product?.computedComboMRP ?? 0);
  }
  if (String(product?.productType || "").toLowerCase() === "combo") {
    return Number(product?.mrp ?? 0);
  }
  // For variant products - get MRP from default variant
  const variants = product?.variants;
  if (Array.isArray(variants) && variants.length) {
    const def = getDefaultVariant(variants);
    const mrp = def?.mrp ?? variants[0]?.mrp;
    return Number(mrp ?? 0);
  }
  // For regular products - direct MRP field
  return Number(product?.mrp ?? 0);
}

/**
 * Get price from a specific variant
 */
export function getVariantPrice(variant) {
  return Number(variant?.price ?? 0);
}

/**
 * Get MRP from a specific variant
 */
export function getVariantMRP(variant) {
  return Number(variant?.mrp ?? 0);
}

/**
 * Calculate discount percentage from MRP and price
 * Returns 0 if no valid discount (MRP must be > price)
 * Example: MRP=500, Price=400 → 20% discount
 */
export function calculateDiscount(mrp, price) {
  const m = Number(mrp ?? 0);
  const p = Number(price ?? 0);
  // No discount if MRP is invalid or not greater than price
  if (m <= 0 || p <= 0 || m <= p) return 0;
  // Calculate percentage and round to nearest integer
  return Math.round(((m - p) / m) * 100);
}

/**
 * Get the label of the default variant
 * Returns empty string if product has no variants
 */
export function getDefaultVariantLabel(product) {
  const variants = product?.variants;
  if (!Array.isArray(variants) || !variants.length) return "";
  return String(getDefaultVariant(variants)?.label || variants[0]?.label || "").trim();
}


