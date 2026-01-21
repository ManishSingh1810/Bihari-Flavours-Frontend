import React from "react";

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="ds-eyebrow">Policy</p>
          <h1 className="ds-title mt-2">Returns & refunds</h1>
          <p className="ds-body mt-2 max-w-2xl">
            Food products are sensitive—if there’s an issue with your order, we’ll make it right. Reach us on
            WhatsApp for quick support.
          </p>
        </div>

        <div className="space-y-4">
          <div className="ds-card p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Damaged or incorrect items</h2>
            <p className="mt-2 text-sm text-[#475569] leading-relaxed">
              If you receive a damaged, missing, or incorrect item, contact us within{" "}
              <span className="font-semibold">24 hours</span> of delivery with photos and your order ID.
            </p>
          </div>

          <div className="ds-card p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Refunds</h2>
            <p className="mt-2 text-sm text-[#475569] leading-relaxed">
              Once approved, refunds are processed to the original payment method. Timelines depend on your bank
              and payment provider.
            </p>
          </div>

          <div className="ds-card p-6">
            <h2 className="text-lg font-semibold text-[#0F172A]">Support</h2>
            <p className="mt-2 text-sm text-[#475569] leading-relaxed">
              WhatsApp: <a className="font-semibold text-[#8E1B1B] hover:underline" href="https://wa.me/9185211754329" target="_blank" rel="noreferrer">+91 85211 754329</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

