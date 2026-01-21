import React from "react";
import EmptyState from "../ui/EmptyState.jsx";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="ds-eyebrow">Policy</p>
          <h1 className="ds-title mt-2">Shipping</h1>
          <p className="ds-body mt-2 max-w-2xl">
            We dispatch quickly and keep you updated. Shipping charges (if any) are shown at checkout.
          </p>
        </div>

        <div className="space-y-4">
          <div className="ds-card p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Dispatch time</h2>
            <p className="mt-2 text-sm text-[#475569] leading-relaxed">
              Most orders are dispatched within <span className="font-semibold">24–48 hours</span>.
              During peak periods, dispatch may take a little longer.
            </p>
          </div>

          <div className="ds-card p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Delivery timeline</h2>
            <p className="mt-2 text-sm text-[#475569] leading-relaxed">
              Delivery timelines depend on your location and courier availability. You’ll receive tracking
              details once your order is shipped.
            </p>
          </div>

          <div className="ds-card p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Tracking</h2>
            <p className="mt-2 text-sm text-[#475569] leading-relaxed">
              Track your order anytime from the <span className="font-semibold">Orders</span> page after login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

