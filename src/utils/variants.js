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

export function getDefaultVariantLabel(product) {
  const variants = product?.variants;
  if (!Array.isArray(variants) || !variants.length) return "";
  return String(getDefaultVariant(variants)?.label || variants[0]?.label || "").trim();
}

