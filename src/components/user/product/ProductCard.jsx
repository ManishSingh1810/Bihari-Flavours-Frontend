import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import ProductBadge from "./ProductBadge.jsx";
import QtyStepper from "./QtyStepper.jsx";

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
    <article
      className={cn(
        "group relative rounded-3xl bg-white p-3 sm:p-4",
        "ring-1 ring-black/5 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        "transition hover:shadow-md hover:ring-black/10",
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
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
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

          <div onClick={(e) => e.stopPropagation()}>
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
              <button
                type="button"
                onClick={() => onAdd?.(product._id)}
                disabled={disabled || out}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2",
                  "text-[11px] sm:text-xs font-semibold whitespace-nowrap",
                  out
                    ? "bg-white text-gray-400 ring-1 ring-black/10 cursor-not-allowed"
                    : "bg-[#8E1B1B] text-white hover:bg-[#741616]",
                  "disabled:opacity-50"
                )}
              >
                {out ? "Out of stock" : "Add to cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

