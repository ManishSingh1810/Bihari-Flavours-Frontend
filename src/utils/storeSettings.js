/**
 * Store settings shared by the admin page and customer checkout preview.
 *
 * GET /api/admin/store-settings and PUT /api/admin/store-settings use the
 * StoreSettings object below as the body. The public checkout endpoint
 * returns the same shape. A COD maximum of 0 means no limit.
 *
 * Defaults match the live checkout: delivery is not charged, and cash on
 * delivery adds ₹30. No separate delivery charge was configured in the
 * previous checkout, so the standard charge starts at 0 with delivery off.
 */
import api from "../api/axios";

export const STORE_SETTINGS_STORAGE_KEY = "bf.admin.storeSettings.v1";

export const STORE_SETTINGS_API = {
  get: "/admin/store-settings",
  put: "/admin/store-settings",
};

export const MAX_MONEY = 100000;
export const MAX_PREVIEW_SUBTOTAL = 1000000;
export const MAX_NOTICE_LENGTH = 300;

/**
 * Numeric settings document. This is the shape to send to the API later.
 * Money fields are rupees, never negative. A COD maximum of 0 means no limit.
 *
 * @typedef {Object} DeliverySettings
 * @property {number} standardCharge
 * @property {boolean} freeDeliveryEnabled
 * @property {number} freeDeliveryMinOrder
 * @property {boolean} deliveryChargesEnabled
 *
 * @typedef {Object} CodSettings
 * @property {boolean} enabled
 * @property {number} handlingFee
 * @property {number} minOrderAmount
 * @property {number} maxOrderAmount
 *
 * @typedef {Object} CheckoutSettings
 * @property {number} minOrderValue
 * @property {boolean} onlinePaymentsEnabled
 * @property {string} notice
 *
 * @typedef {Object} StoreSettings
 * @property {DeliverySettings} delivery
 * @property {CodSettings} cod
 * @property {CheckoutSettings} checkout
 */

/**
 * Form state. Money is kept as a string so partial input ("", "12.") is safe.
 *
 * @typedef {Object} DeliverySettingsForm
 * @property {string} standardCharge
 * @property {boolean} freeDeliveryEnabled
 * @property {string} freeDeliveryMinOrder
 * @property {boolean} deliveryChargesEnabled
 *
 * @typedef {Object} CodSettingsForm
 * @property {boolean} enabled
 * @property {string} handlingFee
 * @property {string} minOrderAmount
 * @property {string} maxOrderAmount
 *
 * @typedef {Object} CheckoutSettingsForm
 * @property {string} minOrderValue
 * @property {boolean} onlinePaymentsEnabled
 * @property {string} notice
 *
 * @typedef {Object} StoreSettingsForm
 * @property {DeliverySettingsForm} delivery
 * @property {CodSettingsForm} cod
 * @property {CheckoutSettingsForm} checkout
 */

/** @type {StoreSettings} */
export const DEFAULT_STORE_SETTINGS = {
  delivery: {
    standardCharge: 0,
    freeDeliveryEnabled: false,
    freeDeliveryMinOrder: 0,
    deliveryChargesEnabled: false,
  },
  cod: {
    enabled: true,
    handlingFee: 30,
    minOrderAmount: 0,
    maxOrderAmount: 0,
  },
  checkout: {
    minOrderValue: 0,
    onlinePaymentsEnabled: true,
    notice: "",
  },
};

/**
 * Accepts a complete amount or a trailing dot while the admin is typing.
 * Returns null for empty or invalid input. Never returns a negative number.
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseMoneyDraft(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return null;
    return roundMoney(value);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;
  const numeric = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
  if (numeric === "") return null;
  const amount = Number(numeric);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return roundMoney(amount);
}

/**
 * @param {number} amount
 * @returns {number}
 */
export function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function formatMoneyInput(value) {
  const amount = typeof value === "number" ? parseMoneyDraft(value) : parseMoneyDraft(String(value ?? ""));
  if (amount == null) return "";
  return amount.toFixed(2);
}

/**
 * @param {number} amount
 * @returns {string}
 */
export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Strips currency symbols and commas. Returns null when the keystroke
 * should be ignored so the field never holds a negative or junk value.
 * @param {string} raw
 * @returns {string | null}
 */
export function sanitizeMoneyInput(raw) {
  const cleaned = String(raw).replace(/[₹,\s]/g, "");
  if (cleaned === "" || /^\d*\.?\d{0,2}$/.test(cleaned)) return cleaned;
  return null;
}

/**
 * @param {StoreSettings} settings
 * @returns {StoreSettingsForm}
 */
export function settingsToForm(settings) {
  const safe = normalizeStoreSettings(settings);
  return {
    delivery: {
      standardCharge: formatMoneyInput(safe.delivery.standardCharge),
      freeDeliveryEnabled: safe.delivery.freeDeliveryEnabled,
      freeDeliveryMinOrder: formatMoneyInput(safe.delivery.freeDeliveryMinOrder),
      deliveryChargesEnabled: safe.delivery.deliveryChargesEnabled,
    },
    cod: {
      enabled: safe.cod.enabled,
      handlingFee: formatMoneyInput(safe.cod.handlingFee),
      minOrderAmount: formatMoneyInput(safe.cod.minOrderAmount),
      maxOrderAmount: formatMoneyInput(safe.cod.maxOrderAmount),
    },
    checkout: {
      minOrderValue: formatMoneyInput(safe.checkout.minOrderValue),
      onlinePaymentsEnabled: safe.checkout.onlinePaymentsEnabled,
      notice: safe.checkout.notice,
    },
  };
}

/**
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function asMoney(value, fallback) {
  const amount = parseMoneyDraft(typeof value === "number" ? value : String(value ?? ""));
  if (amount == null || amount > MAX_MONEY) return fallback;
  return amount;
}

/**
 * @param {unknown} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
function asBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

/**
 * @param {unknown} input
 * @returns {StoreSettings}
 */
export function normalizeStoreSettings(input) {
  const source = input && typeof input === "object" ? /** @type {Record<string, any>} */ (input) : {};
  const delivery = source.delivery && typeof source.delivery === "object" ? source.delivery : {};
  const cod = source.cod && typeof source.cod === "object" ? source.cod : {};
  const checkout = source.checkout && typeof source.checkout === "object" ? source.checkout : {};
  const defaults = DEFAULT_STORE_SETTINGS;

  return {
    delivery: {
      standardCharge: asMoney(delivery.standardCharge, defaults.delivery.standardCharge),
      freeDeliveryEnabled: asBoolean(delivery.freeDeliveryEnabled, defaults.delivery.freeDeliveryEnabled),
      freeDeliveryMinOrder: asMoney(delivery.freeDeliveryMinOrder, defaults.delivery.freeDeliveryMinOrder),
      deliveryChargesEnabled: asBoolean(
        delivery.deliveryChargesEnabled,
        defaults.delivery.deliveryChargesEnabled
      ),
    },
    cod: {
      enabled: asBoolean(cod.enabled, defaults.cod.enabled),
      handlingFee: asMoney(cod.handlingFee, defaults.cod.handlingFee),
      minOrderAmount: asMoney(cod.minOrderAmount, defaults.cod.minOrderAmount),
      maxOrderAmount: asMoney(cod.maxOrderAmount, defaults.cod.maxOrderAmount),
    },
    checkout: {
      minOrderValue: asMoney(checkout.minOrderValue, defaults.checkout.minOrderValue),
      onlinePaymentsEnabled: asBoolean(
        checkout.onlinePaymentsEnabled,
        defaults.checkout.onlinePaymentsEnabled
      ),
      notice: asNotice(checkout.notice),
    },
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function asNotice(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_NOTICE_LENGTH);
}

/**
 * @param {string} value
 * @param {{ empty: string, invalid: string, tooHigh: string }} messages
 * @returns {string}
 */
function validateAmount(value, messages) {
  if (String(value ?? "").trim() === "") return messages.empty;
  const amount = parseMoneyDraft(value);
  if (amount == null) return messages.invalid;
  if (amount > MAX_MONEY) return messages.tooHigh;
  return "";
}

/**
 * Validates the editable form. Disabled sections are not blocking:
 * their last valid numbers are kept on save.
 * @param {StoreSettingsForm} form
 * @returns {Record<string, string>}
 */
export function validateStoreSettingsForm(form) {
  /** @type {Record<string, string>} */
  const errors = {};
  const deliveryOn = Boolean(form?.delivery?.deliveryChargesEnabled);
  const freeOn = Boolean(form?.delivery?.freeDeliveryEnabled);
  const codOn = Boolean(form?.cod?.enabled);

  if (deliveryOn) {
    const chargeError = validateAmount(form.delivery.standardCharge, {
      empty: "Enter a standard delivery charge. Use 0 if delivery is free.",
      invalid: "Enter a valid delivery charge of 0 or more.",
      tooHigh: "Standard delivery charge must be ₹1,00,000 or less.",
    });
    if (chargeError) errors["delivery.standardCharge"] = chargeError;

    if (freeOn) {
      const freeError = validateAmount(form.delivery.freeDeliveryMinOrder, {
        empty: "Enter the minimum order amount for free delivery.",
        invalid: "Enter a valid free-delivery minimum of 0 or more.",
        tooHigh: "Free-delivery minimum must be ₹1,00,000 or less.",
      });
      if (freeError) errors["delivery.freeDeliveryMinOrder"] = freeError;
    }
  }

  if (codOn) {
    const feeError = validateAmount(form.cod.handlingFee, {
      empty: "Enter a COD handling fee. Use 0 if there is no extra fee.",
      invalid: "Enter a valid COD handling fee of 0 or more.",
      tooHigh: "COD handling fee must be ₹1,00,000 or less.",
    });
    if (feeError) errors["cod.handlingFee"] = feeError;

    const minError = validateAmount(form.cod.minOrderAmount, {
      empty: "Enter the minimum order amount for cash on delivery.",
      invalid: "Enter a valid COD minimum of 0 or more.",
      tooHigh: "COD minimum must be ₹1,00,000 or less.",
    });
    if (minError) errors["cod.minOrderAmount"] = minError;

    const maxError = validateAmount(form.cod.maxOrderAmount, {
      empty: "Enter the maximum order amount for cash on delivery, or 0 for no limit.",
      invalid: "Enter a valid COD maximum of 0 or more.",
      tooHigh: "COD maximum must be ₹1,00,000 or less.",
    });
    if (maxError) errors["cod.maxOrderAmount"] = maxError;

    const min = parseMoneyDraft(form.cod.minOrderAmount);
    const max = parseMoneyDraft(form.cod.maxOrderAmount);
    if (!minError && !maxError && min != null && max != null && max > 0 && max < min) {
      errors["cod.maxOrderAmount"] = `Maximum must be at least ${formatINR(min)}, or enter 0 for no limit.`;
    }
  }

  const minOrderError = validateAmount(form?.checkout?.minOrderValue, {
    empty: "Enter a minimum order value. Use 0 if there is no minimum.",
    invalid: "Enter a valid minimum order value of 0 or more.",
    tooHigh: "Minimum order value must be ₹1,00,000 or less.",
  });
  if (minOrderError) errors["checkout.minOrderValue"] = minOrderError;

  const notice = String(form?.checkout?.notice ?? "");
  if (notice.trim().length > MAX_NOTICE_LENGTH) {
    errors["checkout.notice"] = `Checkout notice must be ${MAX_NOTICE_LENGTH} characters or fewer.`;
  }

  if (!form?.cod?.enabled && !form?.checkout?.onlinePaymentsEnabled) {
    errors.paymentMethods = "At least one payment method must stay enabled.";
  }

  return errors;
}

/**
 * Builds the numeric document from a valid form.
 * Invalid amounts in disabled sections fall back to the last saved settings.
 * @param {StoreSettingsForm} form
 * @param {StoreSettings} fallback
 * @returns {StoreSettings}
 */
export function formToSettings(form, fallback) {
  const base = normalizeStoreSettings(fallback);
  const pick = (raw, saved) => {
    const amount = parseMoneyDraft(raw);
    if (amount == null || amount > MAX_MONEY) return saved;
    return amount;
  };

  return normalizeStoreSettings({
    delivery: {
      standardCharge: pick(form.delivery.standardCharge, base.delivery.standardCharge),
      freeDeliveryEnabled: Boolean(form.delivery.freeDeliveryEnabled),
      freeDeliveryMinOrder: pick(form.delivery.freeDeliveryMinOrder, base.delivery.freeDeliveryMinOrder),
      deliveryChargesEnabled: Boolean(form.delivery.deliveryChargesEnabled),
    },
    cod: {
      enabled: Boolean(form.cod.enabled),
      handlingFee: pick(form.cod.handlingFee, base.cod.handlingFee),
      minOrderAmount: pick(form.cod.minOrderAmount, base.cod.minOrderAmount),
      maxOrderAmount: pick(form.cod.maxOrderAmount, base.cod.maxOrderAmount),
    },
    checkout: {
      minOrderValue: pick(form.checkout.minOrderValue, base.checkout.minOrderValue),
      onlinePaymentsEnabled: Boolean(form.checkout.onlinePaymentsEnabled),
      notice: String(form.checkout.notice ?? ""),
    },
  });
}

/**
 * @param {StoreSettingsForm} form
 * @param {StoreSettings} saved
 * @returns {boolean}
 */
export function hasUnsavedSettings(form, saved) {
  return JSON.stringify(form) !== JSON.stringify(settingsToForm(saved));
}

/**
 * @typedef {Object} CheckoutPreviewInput
 * @property {string} subtotal
 * @property {"COD" | "ONLINE"} paymentMethod
 *
 * @typedef {Object} CheckoutPreview
 * @property {number | null} subtotal
 * @property {number | null} deliveryCharge
 * @property {string} deliveryNote
 * @property {boolean} codApplicable
 * @property {number | null} codFee
 * @property {string} codNote
 * @property {number | null} total
 * @property {string[]} warnings
 * @property {string} notice
 */

/**
 * Pure preview calculator. It does not read storage or place an order.
 * @param {StoreSettingsForm} form
 * @param {CheckoutPreviewInput} input
 * @returns {CheckoutPreview}
 */
export function calculateCheckoutPreview(form, input) {
  const subtotal = parseMoneyDraft(input.subtotal);
  const subtotalTooHigh = subtotal != null && subtotal > MAX_PREVIEW_SUBTOTAL;
  const knownSubtotal = subtotalTooHigh ? null : subtotal;

  let deliveryCharge = 0;
  let deliveryKnown = true;
  let deliveryNote = "Delivery charges are turned off.";

  if (form.delivery.deliveryChargesEnabled) {
    const standard = parseMoneyDraft(form.delivery.standardCharge);
    if (standard == null || standard > MAX_MONEY) {
      deliveryKnown = false;
      deliveryCharge = 0;
      deliveryNote = "Enter a valid standard delivery charge.";
    } else if (form.delivery.freeDeliveryEnabled) {
      const minimum = parseMoneyDraft(form.delivery.freeDeliveryMinOrder);
      if (minimum == null || minimum > MAX_MONEY) {
        deliveryKnown = false;
        deliveryNote = "Enter a valid free-delivery minimum.";
      } else if (knownSubtotal == null) {
        deliveryKnown = false;
        deliveryNote = `Free delivery starts at ${formatINR(minimum)}. Enter a subtotal to calculate the charge.`;
      } else if (knownSubtotal >= minimum) {
        deliveryCharge = 0;
        deliveryNote = `Free delivery applies at ${formatINR(minimum)} and above.`;
      } else {
        deliveryCharge = standard;
        deliveryNote = `${formatINR(roundMoney(minimum - knownSubtotal))} more for free delivery.`;
      }
    } else {
      deliveryCharge = standard;
      deliveryNote = "Standard delivery charge.";
    }
  }

  const codApplicable = input.paymentMethod === "COD";
  let codFee = 0;
  let codKnown = true;
  let codNote = "Not charged for online payment.";

  if (codApplicable) {
    if (!form.cod.enabled) {
      codFee = 0;
      codNote = "Cash on delivery is turned off.";
    } else {
      const fee = parseMoneyDraft(form.cod.handlingFee);
      if (fee == null || fee > MAX_MONEY) {
        codKnown = false;
        codNote = "Enter a valid COD handling fee.";
      } else {
        codFee = fee;
        codNote = fee === 0 ? "No handling fee." : "Added because cash on delivery is selected.";
      }
    }
  }

  const total =
    knownSubtotal != null && deliveryKnown && codKnown
      ? roundMoney(knownSubtotal + (deliveryKnown ? deliveryCharge : 0) + (codKnown ? codFee : 0))
      : null;

  /** @type {string[]} */
  const warnings = [];
  if (String(input.subtotal ?? "").trim() === "") {
    warnings.push("Enter a sample cart subtotal to calculate the total.");
  } else if (knownSubtotal == null) {
    warnings.push(
      subtotalTooHigh
        ? "Enter a sample subtotal of ₹10,00,000 or less."
        : "Enter a valid sample subtotal of 0 or more."
    );
  }

  const minOrder = parseMoneyDraft(form.checkout.minOrderValue);
  if (knownSubtotal != null && minOrder != null && knownSubtotal < minOrder) {
    warnings.push(`This subtotal is below the minimum order value of ${formatINR(minOrder)}.`);
  }

  if (codApplicable && form.cod.enabled && knownSubtotal != null) {
    const min = parseMoneyDraft(form.cod.minOrderAmount);
    const max = parseMoneyDraft(form.cod.maxOrderAmount);
    if (min != null && knownSubtotal < min) {
      warnings.push(`Cash on delivery requires at least ${formatINR(min)}.`);
    }
    if (max != null && max > 0 && knownSubtotal > max) {
      warnings.push(`Cash on delivery is available up to ${formatINR(max)}.`);
    }
  }

  if (!form.checkout.onlinePaymentsEnabled && !form.cod.enabled) {
    warnings.push("Both payment methods are turned off, so a customer could not check out.");
  } else if (input.paymentMethod === "ONLINE" && !form.checkout.onlinePaymentsEnabled) {
    warnings.push("Online payment is turned off.");
  } else if (codApplicable && !form.cod.enabled) {
    warnings.push("Cash on delivery is turned off.");
  }

  return {
    subtotal: knownSubtotal,
    deliveryCharge: deliveryKnown ? deliveryCharge : null,
    deliveryNote,
    codApplicable,
    codFee: codApplicable && codKnown ? codFee : codApplicable ? null : 0,
    codNote,
    total,
    warnings,
    notice: String(form.checkout.notice ?? "").trim(),
  };
}

/**
 * @returns {{ settings: StoreSettings, savedAt: string | null, source: "local" | "default" }}
 */
export function loadStoreSettingsLocal() {
  const empty = {
    settings: normalizeStoreSettings(DEFAULT_STORE_SETTINGS),
    savedAt: null,
    source: /** @type {"default"} */ ("default"),
  };

  if (typeof localStorage === "undefined") return empty;

  try {
    const raw = localStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    const payload = parsed && typeof parsed === "object" && parsed.settings ? parsed.settings : parsed;
    return {
      settings: normalizeStoreSettings(payload),
      savedAt: typeof parsed?.savedAt === "string" ? parsed.savedAt : null,
      source: "local",
    };
  } catch {
    return empty;
  }
}

/**
 * Loads settings. Replace the body with GET STORE_SETTINGS_API.get
 * when the backend exists. Keep the return shape.
 * @returns {Promise<{ settings: StoreSettings, savedAt: string | null, source: "local" | "default" | "api" }>}
 */
export async function loadPublicStoreSettings() {
  const res = await api.get("/store-settings/public", { skipErrorToast: true });
  if (!res.data?.success || !res.data.settings) {
    throw new Error(res.data?.message || "Could not load checkout settings.");
  }
  return normalizeStoreSettings(res.data.settings);
}

export async function loadStoreSettings() {
  try {
    const res = await api.get(STORE_SETTINGS_API.get, { skipErrorToast: true });
    if (!res.data?.success || !res.data.settings) {
      throw new Error(res.data?.message || "Could not load store settings.");
    }
    return {
      settings: normalizeStoreSettings(res.data.settings),
      savedAt: res.data.savedAt || null,
      source: "api",
    };
  } catch (error) {
    if (error?.response) {
      throw new Error(error.response.data?.message || "Could not load store settings.");
    }
    if (error instanceof Error && !error.response) throw error;
    throw new Error("Could not load store settings. Check your connection and try again.");
  }
}

/**
 * Saves settings in this browser only.
 * Replace the body with PUT STORE_SETTINGS_API.put when the backend exists.
 * @param {StoreSettings} settings
 * @returns {Promise<{ settings: StoreSettings, savedAt: string, source: "local" | "api" }>}
 */
export async function saveStoreSettings(settings) {
  const clean = normalizeStoreSettings(settings);
  try {
    const res = await api.put(STORE_SETTINGS_API.put, clean, { skipErrorToast: true });
    if (!res.data?.success || !res.data.settings) {
      throw new Error(res.data?.message || "Could not save store settings.");
    }
    return {
      settings: normalizeStoreSettings(res.data.settings),
      savedAt: res.data.savedAt || new Date().toISOString(),
      source: "api",
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      (error instanceof Error ? error.message : "Could not save store settings.");
    const failure = new Error(message);
    failure.fieldErrors = Array.isArray(error?.response?.data?.errors)
      ? error.response.data.errors
      : [];
    throw failure;
  }
}

/**
 * Customer checkout preview. Coupon discount is applied before delivery and COD.
 * The order API recalculates this and is the amount that gets charged.
 */
export function quoteFromSettings(settings, { subtotal, discountPercentage = 0, paymentMethod }) {
  const safe = normalizeStoreSettings(settings);
  const method = String(paymentMethod || "").trim().toUpperCase();
  const subtotalPaise = Math.round((Number(subtotal) || 0) * 100);
  const rate = Number(discountPercentage) || 0;
  let qualifyingPaise = subtotalPaise;
  if (rate > 0) {
    qualifyingPaise = Math.round(subtotalPaise - (subtotalPaise * rate) / 100);
    if (qualifyingPaise < 0) qualifyingPaise = 0;
    if (qualifyingPaise > subtotalPaise) qualifyingPaise = subtotalPaise;
  }

  const issues = [];
  const minimumPaise = Math.round(safe.checkout.minOrderValue * 100);
  if (qualifyingPaise < minimumPaise) {
    issues.push({
      code: "MINIMUM_ORDER",
      message: `Minimum order value is ${formatINR(safe.checkout.minOrderValue)}.`,
    });
  }

  let deliveryPaise = 0;
  let freeDeliveryApplied = false;
  if (safe.delivery.deliveryChargesEnabled) {
    const standardPaise = Math.round(safe.delivery.standardCharge * 100);
    const thresholdPaise = Math.round(safe.delivery.freeDeliveryMinOrder * 100);
    if (safe.delivery.freeDeliveryEnabled && qualifyingPaise >= thresholdPaise) {
      freeDeliveryApplied = true;
    } else {
      deliveryPaise = standardPaise;
    }
  }

  let codPaise = 0;
  if (method === "COD") {
    if (!safe.cod.enabled) {
      issues.push({ code: "COD_DISABLED", message: "Cash on delivery is not available right now." });
    } else {
      codPaise = Math.round(safe.cod.handlingFee * 100);
      const minPaise = Math.round(safe.cod.minOrderAmount * 100);
      if (qualifyingPaise < minPaise) {
        issues.push({
          code: "COD_MINIMUM",
          message: `Cash on delivery is available on orders from ${formatINR(safe.cod.minOrderAmount)}.`,
        });
      }
      if (safe.cod.maxOrderAmount > 0 && qualifyingPaise > Math.round(safe.cod.maxOrderAmount * 100)) {
        issues.push({
          code: "COD_MAXIMUM",
          message: `Cash on delivery is available on orders up to ${formatINR(safe.cod.maxOrderAmount)}.`,
        });
      }
    }
  } else if (method === "ONLINE" && !safe.checkout.onlinePaymentsEnabled) {
    issues.push({ code: "ONLINE_DISABLED", message: "Online payment is not available right now." });
  }

  const amountPaise = qualifyingPaise + deliveryPaise + codPaise;
  const thresholdPaise = Math.round(safe.delivery.freeDeliveryMinOrder * 100);
  const fromPaise = (paise) => paise / 100;

  return {
    subtotal: fromPaise(subtotalPaise),
    couponDiscount: fromPaise(subtotalPaise - qualifyingPaise),
    qualifyingAmount: fromPaise(qualifyingPaise),
    deliveryCharge: fromPaise(deliveryPaise),
    codHandlingFee: fromPaise(codPaise),
    payableAmount: fromPaise(amountPaise),
    amountPaise,
    paymentMethod: method,
    freeDeliveryApplied,
    freeDeliveryRemaining:
      safe.delivery.deliveryChargesEnabled && safe.delivery.freeDeliveryEnabled && !freeDeliveryApplied
        ? fromPaise(Math.max(thresholdPaise - qualifyingPaise, 0))
        : 0,
    issues,
  };
}
