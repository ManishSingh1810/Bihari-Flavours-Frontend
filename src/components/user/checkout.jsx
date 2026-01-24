import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Truck,
  AlertCircle,
  Loader2,
  X,
  Info,
  ShieldCheck,
  PhoneCall,
  PackageCheck,
  Timer
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { showActionToast } from "../ui/showActionToast.jsx";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Field({ id, label, hint, error, required = false, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-[#0F172A]">
          {label}{" "}
          {required ? <span className="text-[#8E1B1B]" aria-hidden="true">*</span> : null}
        </label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function TrustChip({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-black/10">
      <span className="text-[#8E1B1B]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function PaymentOption({ checked, title, subtitle, onChange, badge }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-white p-4 ring-1 transition",
        checked ? "ring-[rgba(142,27,27,0.35)] shadow-[0_10px_30px_rgba(15,23,42,0.08)]" : "ring-black/10 hover:ring-black/20"
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="mt-1 accent-[#8E1B1B]"
          aria-label={title}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
            {badge ? (
              <span className="ds-badge ds-badge-muted ring-black/10">{badge}</span>
            ) : null}
          </div>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p> : null}
        </div>
      </div>
      <div className="shrink-0 text-slate-500">
        <CreditCard className="h-5 w-5" />
      </div>
    </label>
  );
}

/* ================= LOGOUT ================= */
const logoutUser = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

/* ================= RAZORPAY ================= */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.id = "razorpay-checkout-js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = ({ cart, setShowCheckout }) => {
  const savedUser = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  /* ================= CHARGES ================= */
  const COD_CHARGE = 30;

  const shippingCharge =
    paymentMethod === "COD" ? COD_CHARGE : 0;

  const discountAmount = couponApplied
    ? Math.floor(
        (cart.totalAmount * couponApplied.discountPercentage) / 100
      )
    : 0;

  const finalTotal =
    cart.totalAmount + shippingCharge - discountAmount;

  /* ================= FORM ================= */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: savedUser.name || "",
      phone: savedUser.phone || "",
      address: "",
      pincode: "",
      city: "",
      state: ""
    }
  });

  const watchedPincode = watch("pincode");

  /* ================= LOCK SCROLL ================= */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  /* ================= PINCODE LOOKUP ================= */
  useEffect(() => {
    const fetchCityState = async () => {
      if (!/^\d{6}$/.test(watchedPincode)) return;

      try {
        setPincodeLoading(true);
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${watchedPincode}`
        );
        const data = await res.json();

        if (data[0]?.Status === "Success") {
          const po = data[0].PostOffice[0];
          setValue("city", po.District, { shouldValidate: true });
          setValue("state", po.State, { shouldValidate: true });
        }
      } catch {
        /* allow manual input */
      } finally {
        setPincodeLoading(false);
      }
    };

    fetchCityState();
  }, [watchedPincode, setValue]);

  /* ================= APPLY COUPON ================= */
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setError("");

      const res = await api.post("/coupons/apply", {
        code: couponCode.trim().toUpperCase(),
        cartAmount: cart.totalAmount
      });

      if (!res.data.success) throw new Error(res.data.message);
      setCouponApplied({
  code: res.data.coupon.code,
  discountPercentage: res.data.coupon.discountPercentage,
  discount: res.data.discount,
  finalTotal: res.data.finalTotal,
});


      // if (!res.data.success) throw new Error(res.data.message);
      // setCouponApplied(res.data.coupon);
      showActionToast({
        title: "Coupon applied",
        message: `Code ${res.data.coupon.code} (${res.data.coupon.discountPercentage}% off)`,
        duration: 3500,
      });

    } catch (err) {
      const msg = err.response?.data?.message || "Invalid coupon";
setError(msg);
toast.error(msg);

    } finally {
      setCouponLoading(false);
    }
  };

  /* ================= RAZORPAY ================= */
  const handleRazorpayPayment = async (orderData) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Payment gateway failed to load");
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.razorpayOrder.amount,
      currency: "INR",
      name: "Bihari Flavours",
      description: "Order Payment",
      order_id: orderData.razorpayOrder.id,
      prefill: {
        name: savedUser.name || "",
        contact: savedUser.phone || ""
      },
      handler: () => {
        showActionToast({
          title: "Payment successful",
          message: "Your order is confirmed. You can track it in Order History.",
          actionLabel: "View order",
          onAction: () => {
            setShowCheckout(false);
            navigate("/order");
          },
          duration: 3500,
        });

  setTimeout(() => {
    setShowCheckout(false);
          navigate("/order");
        }, 800);
},
      modal: {
        ondismiss: () => setLoading(false)
      },
      theme: { color: "#8E1B1B" }
    });

    rzp.open();
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      const orderPayload = {
        items: cart.cartItems,
        shippingAddress: {
          name: data.name,
          phone: data.phone,
          street: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.pincode
        },
        paymentMethod,
        shippingCharge,
        couponCode: couponApplied?.code || null,
        discountAmount,
        totalAmount: finalTotal
      };

      const res = await api.post("/orders/create", orderPayload);

      if (paymentMethod === "COD") {
        showActionToast({
          title: "Order placed",
          message: "Thanks! Your order was placed successfully.",
          actionLabel: "View order",
          onAction: () => {
            setShowCheckout(false);
            navigate("/order");
          },
          duration: 3500,
        });

  setTimeout(() => {
    setShowCheckout(false);
          navigate("/order");
        }, 800);
      } else {
        await handleRazorpayPayment(res.data);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      const msg = err.response?.data?.message || "Checkout failed";
setError(msg);
toast.error(msg);
setLoading(false);
    }
  };

  if (!cart?.cartItems?.length) return null;

  /* ================= UI ================= */
  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      style={{ zIndex: 100000 }}
    >
      <div className="mx-auto mt-6 w-full max-w-5xl">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 bg-white px-5 py-5 sm:px-7">
            <div className="min-w-0">
              <p className="ds-eyebrow">Secure checkout</p>
              <h2 className="mt-1 text-xl font-semibold text-[#0F172A]" style={{ fontFamily: "var(--font-heading)" }}>
                Complete your order
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Shipping details + payment method. Your information stays private.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 rounded-full p-0"
              onClick={() => setShowCheckout(false)}
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="bg-[color:var(--ds-bg)] px-5 py-4 sm:px-7">
            <div className="flex flex-wrap gap-2">
              <TrustChip icon={<ShieldCheck className="h-4 w-4" />} text="Secure payments" />
              <TrustChip icon={<PackageCheck className="h-4 w-4" />} text="Hygienic packing" />
              <TrustChip icon={<Timer className="h-4 w-4" />} text="Dispatch 24–48 hrs" />
              <TrustChip icon={<PhoneCall className="h-4 w-4" />} text="WhatsApp support" />
            </div>
          </div>

          <div className="px-5 pb-6 pt-5 sm:px-7">
            {error ? (
              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <div className="min-w-0">
                  <p className="font-semibold">Checkout issue</p>
                  <p className="mt-0.5 text-red-700/90">{error}</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-3">
              {/* LEFT */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#8E1B1B]" />
                      <h3 className="text-base font-semibold text-[#0F172A]">Shipping address</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Fields marked <span className="text-[#8E1B1B]">*</span> are required
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="checkout-name" label="Full name" required>
                      <Input
                        id="checkout-name"
                        {...register("name", { required: true })}
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </Field>

                    <Field id="checkout-phone" label="Phone number" required error={errors.phone?.message}>
                      <Input
                        id="checkout-phone"
                        {...register("phone", {
                          required: "Phone is required",
                          pattern: { value: /^\d{10}$/, message: "Enter valid 10 digit number" }
                        })}
                        placeholder="10 digit mobile number"
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field id="checkout-address" label="Full address" required>
                      <textarea
                        id="checkout-address"
                        {...register("address", { required: true })}
                        placeholder="House / Street / Landmark"
                        className={cn("ds-input min-h-[96px] resize-none")}
                        autoComplete="street-address"
                      />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Field
                      id="checkout-pincode"
                      label="Pincode"
                      required
                      hint={pincodeLoading ? "Fetching city/state…" : ""}
                    >
                      <Input
                        id="checkout-pincode"
                        {...register("pincode", { required: true })}
                        placeholder="6 digit pincode"
                        inputMode="numeric"
                        autoComplete="postal-code"
                      />
                    </Field>

                    <Field id="checkout-city" label="City" required>
                      <Input
                        id="checkout-city"
                        {...register("city", { required: true })}
                        placeholder="City"
                        disabled={pincodeLoading}
                        autoComplete="address-level2"
                      />
                    </Field>

                    <Field id="checkout-state" label="State" required>
                      <Input
                        id="checkout-state"
                        {...register("state", { required: true })}
                        placeholder="State"
                        disabled={pincodeLoading}
                        autoComplete="address-level1"
                      />
                    </Field>
                  </div>
                </Card>

                {/* PAYMENT */}
                <Card className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#8E1B1B]" />
                    <h3 className="text-base font-semibold text-[#0F172A]">Payment method</h3>
                  </div>

                  <div className="space-y-3">
                    <PaymentOption
                      checked={paymentMethod === "ONLINE"}
                      title="Online payment"
                      subtitle="UPI / Cards / Netbanking via Razorpay"
                      badge="Recommended"
                      onChange={() => setPaymentMethod("ONLINE")}
                    />

                    <PaymentOption
                      checked={paymentMethod === "COD"}
                      title={`Cash on delivery`}
                      subtitle={`Pay when you receive (+Rs. ${COD_CHARGE} COD fee)`}
                      onChange={() => setPaymentMethod("COD")}
                    />
                  </div>

                  {paymentMethod === "COD" ? (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-xs text-blue-800 ring-1 ring-blue-100">
                      <Info className="mt-0.5 h-4 w-4" /> Pay online to save Rs. {COD_CHARGE}.
                    </div>
                  ) : (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800 ring-1 ring-emerald-100">
                      <ShieldCheck className="mt-0.5 h-4 w-4" /> Secure checkout powered by Razorpay.
                    </div>
                  )}
                </Card>
              </div>

              {/* SUMMARY */}
              <div className="md:sticky md:top-6 h-fit space-y-4">
                <Card className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-[#0F172A]">Order summary</h3>
                    <span className="text-xs text-slate-500 tabular-nums">{cart.cartItems.length} items</span>
                  </div>

                  <div className="space-y-3">
                    {cart.cartItems.slice(0, 3).map((it) => (
                      <div key={it.productId} className="flex items-center gap-3">
                        <img
                          src={it.photo}
                          alt={it.name}
                          className="h-12 w-12 rounded-xl object-cover ring-1 ring-black/10"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#0F172A]">{it.name}</p>
                          <p className="text-xs text-slate-600 tabular-nums">
                            Qty {it.quantity} • Rs. {it.price}
                          </p>
                        </div>
                      </div>
                    ))}
                    {cart.cartItems.length > 3 ? (
                      <p className="text-xs text-slate-500">+ {cart.cartItems.length - 3} more items</p>
                    ) : null}
                  </div>

                  <div className="mt-5 border-t border-black/5 pt-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        disabled={!!couponApplied}
                        className="bg-white"
                      />
                      {!couponApplied ? (
                        <Button type="button" variant="secondary" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
                          {couponLoading ? "Applying…" : "Apply"}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setCouponApplied(null);
                            setCouponCode("");
                            setError("");
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {couponApplied ? (
                      <p className="mt-2 text-xs text-emerald-700">
                        Applied <span className="font-semibold">{couponApplied.code}</span> ({couponApplied.discountPercentage}% off)
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-700 tabular-nums">
                      <span>Subtotal</span>
                      <span>Rs. {cart.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 tabular-nums">
                      <span>COD fee</span>
                      <span>Rs. {shippingCharge}</span>
                    </div>
                    {couponApplied ? (
                      <div className="flex justify-between text-emerald-700 tabular-nums">
                        <span>Discount</span>
                        <span>-Rs. {discountAmount}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-black/5 pt-3 text-base font-semibold text-[#0F172A] tabular-nums">
                      <span>Total</span>
                      <span>Rs. {finalTotal}</span>
                    </div>
                    <p className="text-xs text-slate-500">Shipping calculated at checkout. Dispatch in 24–48 hrs.</p>
                  </div>

                  <Button type="submit" disabled={loading} className="mt-5 w-full py-3 text-base">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing…
                      </>
                    ) : paymentMethod === "COD" ? (
                      `Place order • Rs. ${finalTotal}`
                    ) : (
                      `Pay securely • Rs. ${finalTotal}`
                    )}
                  </Button>
                </Card>

                <p className="px-1 text-xs text-slate-500">
                  By placing your order, you agree to our policies. For online payments, you’ll be redirected to Razorpay’s secure checkout.
                </p>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  );
};

export default Checkout;
