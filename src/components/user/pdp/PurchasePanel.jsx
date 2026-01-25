import React, { useMemo } from "react";
import { ShieldCheck, Truck, BadgeCheck, CheckCircle2 } from "lucide-react";
import Card from "../../ui/Card.jsx";
import Button from "../../ui/Button.jsx";
import Badge from "../../ui/Badge.jsx";
import QtyStepper from "../product/QtyStepper.jsx";
import { Link } from "react-router-dom";
import { useReviewSummary } from "../hooks/useReviewSummary.jsx";
import { getDefaultVariant, getVariantByLabel } from "../../../utils/variants.js";

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
  shelfLife,
  variants = [],
  selectedVariantLabel = "",
  onSelectVariant,
  onAdd,
  onMinus,
  onBuyNow,
}) {
  const tagline = useMemo(
    () => getTagline(product?.description || product?.desc),
    [product]
  );
  const { avg, count } = useReviewSummary(product?._id);

  const stockTone = isOutOfStock ? "danger" : "brand";
  const stockText = isOutOfStock ? "Out of stock" : "In stock";

  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const selectedVariant = hasVariants
    ? getVariantByLabel(variants, selectedVariantLabel) || getDefaultVariant(variants) || variants[0]
    : null;
  const displayPrice = hasVariants
    ? Number(selectedVariant?.price ?? getDefaultVariant(variants)?.price ?? product?._price ?? product?.price ?? 0)
    : Number(product?._price ?? product?.price ?? 0);

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
        {count > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1.5 ring-1 ring-black/5">
            <span className="font-semibold text-[#0F172A] tabular-nums">
              {avg.toFixed(1)}
            </span>
            <span className="text-[#8E1B1B]">
              {"★".repeat(Math.round(avg || 0))}
              <span className="text-[#CBD5E1]">
                {"★".repeat(Math.max(0, 5 - Math.round(avg || 0)))}
              </span>
            </span>
            <span className="text-[#64748B] tabular-nums">({count})</span>
          </div>
        ) : null}
        {netQuantity ? <Chip label={`Net Qty: ${netQuantity}`} /> : null}
        {shelfLife ? <Chip label={`Shelf life: ${shelfLife}`} /> : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tabular-nums text-[#8E1B1B]">
          {formatRs(displayPrice)}
        </p>
        <p className="text-xs text-[#64748B]">MRP inclusive of taxes</p>
      </div>

      {hasVariants ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-[#0F172A]">Size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const label = String(v?.label || "").trim();
              const active = String(selectedVariant?.label || "") === label || (!selectedVariant && idx === 0);
              const out = Number(v?.stock ?? 0) === 0;
              return (
                <button
                  key={`${label}-${idx}`}
                  type="button"
                  onClick={() => onSelectVariant?.(label)}
                  className={[
                    "rounded-full px-3 py-2 text-sm font-semibold ring-1 transition",
                    "focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]",
                    active ? "bg-white ring-[rgba(142,27,27,0.35)] text-[#0F172A]" : "bg-[#F8FAFC] ring-black/10 text-[#475569] hover:bg-white",
                    out ? "opacity-60" : "",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  {label || `Variant ${idx + 1}`}
                </button>
              );
            })}
          </div>
          {selectedVariantLabel ? (
            <p className="mt-2 text-xs text-[#64748B]">
              Selected: <span className="font-semibold text-[#0F172A]">{selectedVariantLabel}</span>
              {Number(selectedVariant?.stock ?? 0) === 0 ? " (out of stock)" : null}
            </p>
          ) : null}
        </div>
      ) : null}

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
          <TrustPill icon={<BadgeCheck className="h-4 w-4" />} text="Hygienic packing" />
          <TrustPill icon={<Truck className="h-4 w-4" />} text="Fast dispatch" />
          <TrustPill icon={<ShieldCheck className="h-4 w-4" />} text="Secure payments" />
          <TrustPill icon={<CheckCircle2 className="h-4 w-4" />} text="Quality checked" />
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          Shipping calculated at checkout. See our{" "}
          <Link to="/shipping" className="font-semibold text-[#8E1B1B] hover:underline">
            Shipping
          </Link>{" "}
          &{" "}
          <Link to="/returns" className="font-semibold text-[#8E1B1B] hover:underline">
            Returns
          </Link>{" "}
          policy.
        </p>
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

function Chip({ label }) {
  return (
    <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[11px] font-semibold text-[#334155] ring-1 ring-black/5">
      {label}
    </span>
  );
}
