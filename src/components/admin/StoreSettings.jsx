import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Info,
  RotateCcw,
  Save,
  Settings,
  ShoppingBag,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import {
  MAX_NOTICE_LENGTH,
  calculateCheckoutPreview,
  formToSettings,
  formatINR,
  formatMoneyInput,
  hasUnsavedSettings,
  DEFAULT_STORE_SETTINGS,
  loadStoreSettings,
  normalizeStoreSettings,
  parseMoneyDraft,
  sanitizeMoneyInput,
  saveStoreSettings,
  settingsToForm,
  validateStoreSettingsForm,
} from "../../utils/storeSettings";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatSavedAt(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MoneyField({ id, label, hint, value, onChange, onBlur, disabled, error }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="scroll-mt-28" data-settings-error={error ? "true" : undefined}>
      <label htmlFor={id} className={cn("block", disabled && "opacity-60")}>
        <span className="text-sm font-semibold text-[#1F1B16]">{label}</span>
        {hint && (
          <span id={hintId} className="mt-1 block text-xs leading-relaxed text-[#6F675E]">
            {hint}
          </span>
        )}
        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6F675E]">
            ₹
          </span>
          <input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            value={value}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={cn(hint && hintId, error && errorId) || undefined}
            onChange={(event) => {
              const next = sanitizeMoneyInput(event.target.value);
              if (next != null) onChange(next);
            }}
            onBlur={onBlur}
            className={cn(
              "ds-input pl-9",
              error && "ring-2 ring-red-600/30",
              disabled && "cursor-not-allowed"
            )}
          />
        </div>
      </label>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function Toggle({ id, label, description, checked, onChange, disabled }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-left transition",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(142,27,27,0.18)]",
        disabled ? "cursor-not-allowed opacity-60" : "hover:border-[rgba(142,27,27,0.2)]"
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-[#1F1B16]">{label}</span>
        {description && (
          <span className="mt-1 block text-xs leading-relaxed text-[#6F675E]">{description}</span>
        )}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-[#8E1B1B]" : "bg-[#D6D3D1]"
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
            checked && "translate-x-5"
          )}
        />
      </span>
    </button>
  );
}

function Section({ icon, title, description, children }) {
  const Glyph = icon;
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-[rgba(142,27,27,0.25)] p-2.5 text-[#8E1B1B]">
          <Glyph size={18} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#1F1B16]">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#6F675E]">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function PreviewRow({ label, value, note, emphasis = false }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", emphasis && "pt-1")}>
      <div>
        <p className={cn("text-sm", emphasis ? "font-semibold text-[#1F1B16]" : "text-[#6F675E]")}>
          {label}
        </p>
        {note && <p className="mt-0.5 text-xs leading-relaxed text-[#6F675E]">{note}</p>}
      </div>
      <p
        className={cn(
          "shrink-0 text-sm",
          emphasis ? "text-base font-semibold text-[#8E1B1B]" : "font-medium text-[#1F1B16]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PaymentChoice({ label, checked, disabled, disabledReason, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-left text-sm transition",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(142,27,27,0.18)]",
        checked
          ? "border-[#8E1B1B] bg-[rgba(142,27,27,0.05)] font-semibold text-[#8E1B1B]"
          : "border-black/10 bg-white text-[#1F1B16]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="block">{label}</span>
      {disabled && (
        <span className="mt-0.5 block text-[11px] font-medium text-[#6F675E]">{disabledReason}</span>
      )}
    </button>
  );
}

function CheckoutPreview({ form, subtotal, onSubtotal, paymentMethod, onPaymentMethod }) {
  const preview = useMemo(
    () => calculateCheckoutPreview(form, { subtotal, paymentMethod }),
    [form, subtotal, paymentMethod]
  );
  const money = (amount) => (amount == null ? "—" : formatINR(amount));

  return (
    <aside className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-[rgba(142,27,27,0.25)] p-2.5 text-[#8E1B1B]">
          <ShoppingBag size={18} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#1F1B16]">Checkout preview</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#6F675E]">
            Try a sample cart with the values on this page, including unsaved edits. Customers are charged from the saved settings.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="preview-subtotal" className="block">
          <span className="text-sm font-semibold text-[#1F1B16]">Sample cart subtotal</span>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6F675E]">
              ₹
            </span>
            <input
              id="preview-subtotal"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={subtotal}
              onChange={(event) => {
                const next = sanitizeMoneyInput(event.target.value);
                if (next != null) onSubtotal(next);
              }}
              onBlur={() => {
                const amount = parseMoneyDraft(subtotal);
                if (amount != null) onSubtotal(formatMoneyInput(amount));
              }}
              className="ds-input pl-9"
            />
          </div>
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-[#1F1B16]">Sample payment method</legend>
        <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sample payment method">
          <PaymentChoice
            label="Online"
            checked={paymentMethod === "ONLINE"}
            disabled={!form.checkout.onlinePaymentsEnabled}
            disabledReason="Turned off"
            onSelect={() => onPaymentMethod("ONLINE")}
          />
          <PaymentChoice
            label="Cash on delivery"
            checked={paymentMethod === "COD"}
            disabled={!form.cod.enabled}
            disabledReason="Turned off"
            onSelect={() => onPaymentMethod("COD")}
          />
        </div>
      </fieldset>

      <div className="mt-5 space-y-3 border-t border-black/5 pt-4">
        <PreviewRow label="Cart subtotal" value={money(preview.subtotal)} />
        <PreviewRow
          label="Delivery charge"
          value={money(preview.deliveryCharge)}
          note={preview.deliveryNote}
        />
        {preview.codApplicable && (
          <PreviewRow label="COD handling fee" value={money(preview.codFee)} note={preview.codNote} />
        )}
        <div className="border-t border-black/5 pt-3">
          <PreviewRow label="Total payable" value={money(preview.total)} emphasis />
          <p className="sr-only" aria-live="polite">
            {preview.total == null
              ? "Total payable is unavailable until the sample subtotal and charges are valid."
              : `Total payable ${formatINR(preview.total)}`}
          </p>
        </div>
      </div>

      {preview.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {preview.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs leading-relaxed text-[#6F675E]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {preview.notice && (
        <div className="mt-4 rounded-xl border border-[rgba(142,27,27,0.15)] bg-[#F3EFE8] px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8E1B1B]">
            Customer notice
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#1F1B16]">
            {preview.notice}
          </p>
        </div>
      )}
    </aside>
  );
}

function ActionButtons({ dirty, saving, onReset, submit = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={onReset} disabled={!dirty || saving}>
        <RotateCcw size={16} />
        Reset changes
      </Button>
      <Button type={submit ? "submit" : "button"} disabled={!dirty || saving}>
        <Save size={16} />
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

export default function StoreSettings() {
  const initialSettings = useMemo(() => normalizeStoreSettings(DEFAULT_STORE_SETTINGS), []);
  const [saved, setSaved] = useState(initialSettings);
  const [savedAt, setSavedAt] = useState(null);
  const [form, setForm] = useState(() => settingsToForm(initialSettings));
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [errorScroll, setErrorScroll] = useState(0);
  const [subtotal, setSubtotal] = useState("499.00");
  const [paymentMethod, setPaymentMethod] = useState(initialSettings.cod.enabled ? "COD" : "ONLINE");
  const savingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const initialForm = settingsToForm(initialSettings);
    loadStoreSettings()
      .then((result) => {
        if (cancelled) return;
        const loadedForm = settingsToForm(result.settings);
        setForm((current) =>
          JSON.stringify(current) === JSON.stringify(initialForm) ? loadedForm : current
        );
        setSaved(result.settings);
        setSavedAt(result.savedAt);
        setLoadError("");
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load store settings. Your edits will stay on this page."
        );
      });
    return () => {
      cancelled = true;
    };
  }, [initialSettings]);

  useEffect(() => {
    if (!errorScroll) return undefined;
    const frame = requestAnimationFrame(() => {
      document
        .querySelector("[data-settings-error='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [errorScroll]);

  useEffect(() => {
    setPaymentMethod((current) => {
      const online = form.checkout.onlinePaymentsEnabled;
      const cod = form.cod.enabled;
      if (current === "ONLINE" && !online && cod) return "COD";
      if (current === "COD" && !cod && online) return "ONLINE";
      return current;
    });
  }, [form.checkout.onlinePaymentsEnabled, form.cod.enabled]);

  const errors = useMemo(() => validateStoreSettingsForm(form), [form]);
  const visibleErrors = showErrors ? errors : {};
  const dirty = hasUnsavedSettings(form, saved);
  const deliveryOn = form.delivery.deliveryChargesEnabled;
  const freeOn = deliveryOn && form.delivery.freeDeliveryEnabled;
  const codOn = form.cod.enabled;

  const patchDelivery = (partial) => {
    setForm((current) => ({ ...current, delivery: { ...current.delivery, ...partial } }));
  };
  const patchCod = (partial) => {
    setForm((current) => ({ ...current, cod: { ...current.cod, ...partial } }));
  };
  const patchCheckout = (partial) => {
    setForm((current) => ({ ...current, checkout: { ...current.checkout, ...partial } }));
  };

  const blurMoney = (value, commit) => {
    const amount = parseMoneyDraft(value);
    if (amount != null) commit(formatMoneyInput(amount));
  };

  const resetChanges = () => {
    setForm(settingsToForm(saved));
    setShowErrors(false);
    toast("Unsaved changes discarded.");
  };

  const saveChanges = async () => {
    if (savingRef.current) return;
    const nextErrors = validateStoreSettingsForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setShowErrors(true);
      setErrorScroll((count) => count + 1);
      toast.error("Fix the highlighted fields before saving.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      const result = await saveStoreSettings(formToSettings(form, saved));
      setSaved(result.settings);
      setSavedAt(result.savedAt);
      setForm(settingsToForm(result.settings));
      setShowErrors(false);
      toast.success("Store settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save these settings.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:px-6 sm:py-14">
      <form
        className="mx-auto max-w-6xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (!savingRef.current && dirty) saveChanges();
        }}
      >
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#6F675E] transition-colors hover:text-[#8E1B1B]"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-md border border-[rgba(142,27,27,0.25)] p-3 text-[#8E1B1B]">
              <Settings size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[#1F1B16]">Store Settings</h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#6F675E]">
                Manage delivery charges, payment options, and checkout preferences.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {dirty && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#F3EFE8] px-3 py-1 text-xs font-medium text-[#8E1B1B] ring-1 ring-[rgba(142,27,27,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8E1B1B]" />
                Unsaved changes
              </span>
            )}
            <ActionButtons dirty={dirty} saving={saving} onReset={resetChanges} submit />
          </div>
        </div>

        {loadError ? (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <Info size={18} className="mt-0.5 shrink-0 text-red-700" />
            <p className="text-sm leading-relaxed text-red-800">{loadError}</p>
          </div>
        ) : null}

        {visibleErrors.paymentMethods ? (
          <p className="mt-4 text-sm text-red-700">{visibleErrors.paymentMethods}</p>
        ) : null}

        {showErrors && Object.keys(errors).length > 0 && (
          <p className="mt-4 text-sm text-red-700">Please fix the highlighted fields before saving.</p>
        )}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <Section
              icon={Truck}
              title="Delivery & shipping"
              description="Set the standard delivery charge, and optionally waive it for larger orders."
            >
              <MoneyField
                id="standard-delivery-charge"
                label="Standard delivery charge"
                hint="Charged when free delivery does not apply. Use 0 if you do not want an extra delivery fee."
                value={form.delivery.standardCharge}
                disabled={!deliveryOn || saving}
                error={visibleErrors["delivery.standardCharge"]}
                onChange={(value) => patchDelivery({ standardCharge: value })}
                onBlur={() =>
                  blurMoney(form.delivery.standardCharge, (value) =>
                    patchDelivery({ standardCharge: value })
                  )
                }
              />
              <Toggle
                id="free-delivery"
                label="Free delivery"
                description="Waive the delivery charge when the order reaches the amount below."
                checked={form.delivery.freeDeliveryEnabled}
                disabled={!deliveryOn || saving}
                onChange={(checked) => patchDelivery({ freeDeliveryEnabled: checked })}
              />
              <MoneyField
                id="free-delivery-minimum"
                label="Minimum order value for free delivery"
                hint="Orders at or above this amount pay no delivery charge. Orders below it pay the standard charge."
                value={form.delivery.freeDeliveryMinOrder}
                disabled={!freeOn || saving}
                error={visibleErrors["delivery.freeDeliveryMinOrder"]}
                onChange={(value) => patchDelivery({ freeDeliveryMinOrder: value })}
                onBlur={() =>
                  blurMoney(form.delivery.freeDeliveryMinOrder, (value) =>
                    patchDelivery({ freeDeliveryMinOrder: value })
                  )
                }
              />
              <Toggle
                id="delivery-charges-enabled"
                label="Delivery charges"
                description="Turn this off to ignore the fields above and charge nothing for delivery."
                checked={form.delivery.deliveryChargesEnabled}
                disabled={saving}
                onChange={(checked) => patchDelivery({ deliveryChargesEnabled: checked })}
              />
              {!deliveryOn && (
                <p className="text-xs leading-relaxed text-[#6F675E]">
                  Delivery charges are off. Customers would not pay a delivery fee.
                </p>
              )}
            </Section>

            <Section
              icon={Banknote}
              title="Cash on delivery"
              description="Decide when cash on delivery is offered and whether it adds a handling fee."
            >
              <Toggle
                id="cod-enabled"
                label="Cash on delivery"
                description="Allow customers to pay when the order arrives."
                checked={form.cod.enabled}
                disabled={saving}
                onChange={(checked) => patchCod({ enabled: checked })}
              />
              <MoneyField
                id="cod-fee"
                label="COD handling fee"
                hint="Added only when cash on delivery is selected. Use 0 if there is no extra fee."
                value={form.cod.handlingFee}
                disabled={!codOn || saving}
                error={visibleErrors["cod.handlingFee"]}
                onChange={(value) => patchCod({ handlingFee: value })}
                onBlur={() => blurMoney(form.cod.handlingFee, (value) => patchCod({ handlingFee: value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyField
                  id="cod-minimum"
                  label="Minimum order amount for COD"
                  hint="Lowest cart subtotal that can use cash on delivery."
                  value={form.cod.minOrderAmount}
                  disabled={!codOn || saving}
                  error={visibleErrors["cod.minOrderAmount"]}
                  onChange={(value) => patchCod({ minOrderAmount: value })}
                  onBlur={() =>
                    blurMoney(form.cod.minOrderAmount, (value) => patchCod({ minOrderAmount: value }))
                  }
                />
                <MoneyField
                  id="cod-maximum"
                  label="Maximum order amount for COD"
                  hint="Highest cart subtotal that can use cash on delivery. Use 0 for no limit."
                  value={form.cod.maxOrderAmount}
                  disabled={!codOn || saving}
                  error={visibleErrors["cod.maxOrderAmount"]}
                  onChange={(value) => patchCod({ maxOrderAmount: value })}
                  onBlur={() =>
                    blurMoney(form.cod.maxOrderAmount, (value) => patchCod({ maxOrderAmount: value }))
                  }
                />
              </div>
              {!codOn && (
                <p className="text-xs leading-relaxed text-[#6F675E]">
                  Cash on delivery is off. The fee and order limits are kept, but they are not used.
                </p>
              )}
            </Section>

            <Section
              icon={Settings}
              title="Order & checkout"
              description="Set a minimum order, choose whether online payment is offered, and add an optional note for customers."
            >
              <MoneyField
                id="minimum-order"
                label="Minimum order value"
                hint="The cart must reach this subtotal before checkout. Use 0 if there is no minimum."
                value={form.checkout.minOrderValue}
                disabled={saving}
                error={visibleErrors["checkout.minOrderValue"]}
                onChange={(value) => patchCheckout({ minOrderValue: value })}
                onBlur={() =>
                  blurMoney(form.checkout.minOrderValue, (value) =>
                    patchCheckout({ minOrderValue: value })
                  )
                }
              />
              <Toggle
                id="online-payments"
                label="Online payments"
                description="Allow customers to pay online with Razorpay. At least one payment method must stay on."
                checked={form.checkout.onlinePaymentsEnabled}
                disabled={saving}
                onChange={(checked) => patchCheckout({ onlinePaymentsEnabled: checked })}
              />
              <div
                className="scroll-mt-28"
                data-settings-error={visibleErrors["checkout.notice"] ? "true" : undefined}
              >
                <label htmlFor="checkout-notice" className="block">
                  <span className="text-sm font-semibold text-[#1F1B16]">Checkout notice</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#6F675E]">
                    Optional message for the checkout page. Leave this blank to show nothing.
                  </span>
                  <textarea
                    id="checkout-notice"
                    rows={4}
                    maxLength={MAX_NOTICE_LENGTH}
                    disabled={saving}
                    value={form.checkout.notice}
                    onChange={(event) =>
                      patchCheckout({ notice: event.target.value.slice(0, MAX_NOTICE_LENGTH) })
                    }
                    placeholder="Example: Orders placed before 2 pm are packed the same day."
                    className="ds-input mt-2 min-h-28 resize-y"
                  />
                </label>
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {visibleErrors["checkout.notice"] ? (
                    <p className="text-xs text-red-700">{visibleErrors["checkout.notice"]}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-[#6F675E]">
                    {form.checkout.notice.trim().length}/{MAX_NOTICE_LENGTH}
                  </p>
                </div>
              </div>
            </Section>

            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {dirty ? (
                    <p className="text-sm font-medium text-[#8E1B1B]">You have unsaved changes.</p>
                  ) : (
                    <p className="text-sm text-[#6F675E]">
                      {savedAt
                        ? `Last saved ${formatSavedAt(savedAt)}.`
                        : "Showing the current checkout rules. Delivery is off, and cash on delivery adds ₹30."}
                    </p>
                  )}
                  <p className="mt-1 text-xs leading-relaxed text-[#6F675E]">
                    Saving updates future checkouts. Orders already placed keep their original totals.
                  </p>
                </div>
                <ActionButtons dirty={dirty} saving={saving} onReset={resetChanges} submit />
              </div>
            </div>
          </div>

          <CheckoutPreview
            form={form}
            subtotal={subtotal}
            onSubtotal={setSubtotal}
            paymentMethod={paymentMethod}
            onPaymentMethod={setPaymentMethod}
          />
        </div>
      </form>
    </div>
  );
}
