import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Truck, ShieldCheck } from "lucide-react";
import ProductBadge from "./ProductBadge.jsx";
import QtyStepper from "./QtyStepper.jsx";
import Button from "../../ui/Button.jsx";
import Card from "../../ui/Card.jsx";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function isOutOfStock(product) {
  return product?.quantity === "outofstock";
}

function isBestseller(product) {
  const v =
    product?.isBestseller ||
    product?.bestseller ||
    product?.bestSeller ||
    product?.badge === "bestseller";
  if (Boolean(v)) return true;
  const tags = product?.tags;
  if (Array.isArray(tags) && tags.map(String).some((t) => t.toLowerCase() === "bestseller")) {
    return true;
  }
  return false;
}

function isNew(product) {
  const v = product?.isNew || product?.new || product?.badge === "new";
  if (Boolean(v)) return true;
  const tags = product?.tags;
  if (Array.isArray(tags) && tags.map(String).some((t) => t.toLowerCase() === "new")) {
    return true;
  }
  const createdAt = product?.createdAt ? new Date(product.createdAt).getTime() : null;
  if (createdAt && Number.isFinite(createdAt)) {
    const days = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    return days <= 21;
  }
  return false;
}

function formatRs(amount) {
  if (amount == null || amount === "") return "";
  return `Rs. ${amount}`;
}

export default function ProductCard({
  product,
  qty = 0,
  disabled = false,
  onAdd,
  onMinus,
  showQuickAdd = true,
  className = "",
  imageFit = "contain", // "cover" | "contain"
}) {
  const navigate = useNavigate();
  const out = isOutOfStock(product);

  const img = useMemo(() => {
    return (
      product?.photos?.[0] ||
      product?.photo ||
      "https://placehold.co/900x900/EEE/AAA?text=No+Image"
    );
  }, [product]);

  const weight = product?.netQuantity || product?.weight || product?.size || "";

  return (
    <Card
      hover
      className={cn(
        "group relative p-3 sm:p-4",
        "sm:hover:-translate-y-0.5 transition-transform",
        className
      )}
      onClick={() => navigate(`/product/${product._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product._id}`)}
      aria-label={`View ${product?.name || "product"}`}
    >
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        {isBestseller(product) && !out && <ProductBadge tone="brand">Bestseller</ProductBadge>}
        {isNew(product) && !out && <ProductBadge tone="muted">New</ProductBadge>}
        {out && <ProductBadge tone="danger">Out of stock</ProductBadge>}
      </div>

      {/* Quick add (desktop hover) */}
      {showQuickAdd && !out && (
        <div
          className={cn(
            "absolute right-3 top-3 z-10",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onAdd?.(product._id)}
            disabled={disabled}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8E1B1B]
                       ring-1 ring-black/10 shadow-sm hover:bg-[#F8FAFC] disabled:opacity-50"
            aria-label="Quick add to cart"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl bg-[#F8FAFC] ring-1 ring-black/5">
        <div className="aspect-square w-full">
          <img
            src={img}
            alt={product?.name || "Product image"}
            className={cn(
              "h-full w-full transition-transform duration-300 group-hover:scale-[1.03]",
              imageFit === "cover" ? "object-cover" : "object-contain",
              imageFit === "cover" ? "p-0" : "p-4"
            )}
            loading="lazy"
            draggable="false"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 sm:mt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] sm:text-sm font-semibold text-[#0F172A] line-clamp-1">
              {product?.name}
            </p>
            <p className="mt-1 text-[11px] sm:text-xs text-[#64748B] line-clamp-2 leading-relaxed">
              {product?.desc}
            </p>
          </div>
          {weight ? (
            <span className="shrink-0 rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-semibold text-[#334155] ring-1 ring-black/5">
              {weight}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[13px] sm:text-base font-semibold tabular-nums text-[#8E1B1B]">
            {formatRs(product?.price)}
          </p>

          <span className="text-[11px] sm:text-xs font-semibold text-[#64748B]">
            {weight ? "Per pack" : ""}
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex-1">
            {qty > 0 ? (
              <QtyStepper
                qty={qty}
                size="sm"
                outOfStock={out}
                disabled={disabled}
                onMinus={() => onMinus?.(product._id, qty)}
                onPlus={() => onAdd?.(product._id)}
              />
            ) : (
              <Button
                onClick={() => onAdd?.(product._id)}
                disabled={disabled || out}
                className="h-10 w-full text-[12px]"
              >
                {out ? "Out of stock" : "Add to cart"}
              </Button>
            )}
          </div>
          <Button
            variant="secondary"
            className="h-10 px-3 text-[12px]"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            View details
          </Button>
        </div>

        {/* Trust summary */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748B]">
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-[#8E1B1B]" /> Dispatch 24–48h
          </span>
          <span className="opacity-40">•</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8E1B1B]" /> Secure payments
          </span>
        </div>
      </div>
    </Card>
  );
}

