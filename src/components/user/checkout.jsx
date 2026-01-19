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
  Info
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { showActionToast } from "../ui/showActionToast.jsx";

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
          duration: 5000,
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
          duration: 5000,
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
      <div className="mx-auto mt-10 max-w-4xl rounded-xl bg-white p-6 relative">
        <button
          onClick={() => setShowCheckout(false)}
          className="absolute top-4 right-4"
        >
          <X />
        </button>

        {error && (
          <div className="mb-4 flex gap-2 text-red-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-black/10">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Truck size={18} /> Shipping Address
              </h2>

              <input
                {...register("name", { required: true })}
                placeholder="Full Name"
                className="w-full mb-3 p-2 rounded"
              />

              <input
                {...register("phone", {
                  required: "Phone is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Enter valid 10 digit number"
                  }
                })}
                placeholder="Phone Number"
                className="w-full mb-1 p-2 rounded"
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mb-2">
                  {errors.phone.message}
                </p>
              )}

              <textarea
                {...register("address", { required: true })}
                placeholder="Street Address"
                className="w-full mb-3 p-2 rounded"
              />

              <input
                {...register("pincode", { required: true })}
                placeholder="Pincode"
                className="w-full mb-3 p-2 rounded"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  {...register("city", { required: true })}
                  placeholder="City"
                  disabled={pincodeLoading}
                  className="p-2 rounded"
                />
                <input
                  {...register("state", { required: true })}
                  placeholder="State"
                  disabled={pincodeLoading}
                  className="p-2 rounded"
                />
              </div>
            </div>

            {/* PAYMENT */}
            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-black/10">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard size={18} /> Payment Method
              </h2>

              <label className="flex justify-between p-3 bg-white rounded mb-2 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                Cash on Delivery (+₹{COD_CHARGE})
              </label>

              <label className="flex justify-between p-3 bg-white rounded cursor-pointer">
                <input
                  type="radio"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                />
                Online Payment (No extra charge)
              </label>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="p-6 bg-[#F8FAFC] rounded-xl border border-black/10 h-fit">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="COUPON CODE"
              disabled={couponApplied}
              className="w-full p-2 rounded mb-2"
            />

            {!couponApplied ? (
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading}
                className="w-full border py-2 rounded mb-4"
              >
                {couponLoading ? "Applying..." : "Apply Coupon"}
              </button>
            ) : (
              <p className="text-green-700 text-sm mb-4">
                Applied {couponApplied.code} (
                {couponApplied.discountPercentage}% off)
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cart.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>COD Fee</span>
                <span>₹{shippingCharge}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {paymentMethod === "COD" && (
              <div className="flex gap-2 text-xs text-blue-700 mt-3">
                <Info size={14} /> Pay online to save ₹{COD_CHARGE}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-[#8E1B1B] text-white py-3 rounded"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                `Pay ₹${finalTotal}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default Checkout;
