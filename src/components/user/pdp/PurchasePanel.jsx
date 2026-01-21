import React, { useMemo } from "react";
import { MessageCircle, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import Card from "../../ui/Card.jsx";
import Button from "../../ui/Button.jsx";
import Badge from "../../ui/Badge.jsx";
import QtyStepper from "../product/QtyStepper.jsx";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatRs(amount) {
  if (amount == null || amount === "") return "";
  return `Rs. ${amount}`;
}

function getTagline(desc) {
  const d = String(desc || "").trim();
  if (!d) return "";
  const first = d.split(".")[0]?.trim();
  if (!first) return "";
  return first.length > 90 ? `${first.slice(0, 90)}…` : `${first}.`;
}

export default function PurchasePanel({
  product,
  qty,
  updating,
  isOutOfStock,
  netQuantity,
  onAdd,
  onMinus,
  onBuyNow,
}) {
  const tagline = useMemo(() => getTagline(product?.desc), [product]);
  const rating = 4.8; // placeholder
  const ratingCount = 128; // placeholder

  const stockTone = isOutOfStock ? "danger" : "brand";
  const stockText = isOutOfStock ? "Out of stock" : "In stock";

  return (
    <Card className="p-6 lg:sticky lg:top-24" hover={false}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl text-[#0F172A]">{product?.name}</h1>
          {tagline ? <p className="mt-2 text-sm text-[#64748B]">{tagline}</p> : null}
        </div>
        <Badge tone={stockTone} className="shrink-0">
          {stockText}
        </Badge>
      </div>

      {/* rating summary */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1.5 ring-1 ring-black/5">
          <span className="font-semibold text-[#0F172A]">{rating.toFixed(1)}</span>
          <span className="text-[#8E1B1B]">★★★★★</span>
          <span className="text-[#64748B]">({ratingCount})</span>
        </div>
        {netQuantity ? (
          <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#334155] ring-1 ring-black/5">
            {netQuantity}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tabular-nums text-[#8E1B1B]">
          {formatRs(product?._price ?? product?.price)}
        </p>
        <p className="text-xs text-[#64748B]">MRP inclusive of taxes</p>
      </div>

      {/* delivery estimate */}
      <div className="mt-5 rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-black/5">
        <p className="text-sm font-semibold text-[#0F172A]">Delivery & dispatch</p>
        <div className="mt-2 space-y-1 text-sm text-[#64748B]">
          <p>
            <span className="font-semibold text-[#0F172A]">Dispatch:</span> 24–48 hrs
          </p>
          <p>Shipping calculated at checkout</p>
        </div>
      </div>

      {/* qty + CTAs */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#0F172A]">Quantity</p>
          <QtyStepper
            qty={qty}
            outOfStock={isOutOfStock}
            disabled={updating}
            onMinus={onMinus}
            onPlus={onAdd}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={onAdd}
            disabled={updating || isOutOfStock}
            className="h-12"
          >
            {isOutOfStock ? "Out of stock" : updating ? "Adding…" : "Add to cart"}
          </Button>
          <Button
            variant="secondary"
            onClick={onBuyNow}
            disabled={updating || isOutOfStock}
            className="h-12"
          >
            Buy now
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <TrustPill icon={<ShieldCheck className="h-4 w-4" />} text="Secure payments" />
          <TrustPill icon={<BadgeCheck className="h-4 w-4" />} text="Hygienic packing" />
          <TrustPill icon={<Truck className="h-4 w-4" />} text="Fast dispatch" />
          <TrustPill icon={<MessageCircle className="h-4 w-4" />} text="WhatsApp support" />
        </div>
      </div>
    </Card>
  );
}

function TrustPill({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5 text-sm text-[#475569]">
      <span className="text-[#8E1B1B]">{icon}</span>
      <span className="font-semibold text-[#0F172A]">{text}</span>
    </div>
  );
}

