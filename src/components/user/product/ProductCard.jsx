import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button.jsx";
import Card from "../../ui/Card.jsx";
import ProductImage from "../../ui/ProductImage.jsx";
import { useReviewSummary } from "../hooks/useReviewSummary.jsx";
import { 
  getDefaultVariantLabel, 
  getDisplayPrice, 
  getDisplayMRP, 
  calculateDiscount 
} from "../../../utils/variants.js";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function isOutOfStock(product) {
  return product?.quantity === "outofstock";
}

function formatRs(amount) {
  if (amount == null || amount === "") return "";
  return `Rs. ${amount}`;
}

export default function ProductCard({
  product,
  disabled = false,
  onAdd,
  className = "",
}) {
  const navigate = useNavigate();
  const out = isOutOfStock(product);
  const { avg, count } = useReviewSummary(product?._id);

  const img = useMemo(() => {
    return (
      product?.photos?.[0] ||
      product?.photo ||
      "https://placehold.co/900x900/EEE/AAA?text=No+Image"
    );
  }, [product]);

  const netQty = product?.netQuantity || "";
  const description = product?.description || product?.desc || "";
  const inStock =
    typeof product?.inStock === "boolean" ? product.inStock : product?.quantity !== "outofstock";
  const variantLabel = getDefaultVariantLabel(product);
  const displayPrice = getDisplayPrice(product);
  const displayMRP = getDisplayMRP(product);
  const discount = calculateDiscount(displayMRP, displayPrice);
  const hasDiscount = discount > 0;

  // Debug logging - ALWAYS ON to diagnose issue
  console.log(`[ProductCard] ${product?.name}`, {
    displayPrice,
    displayMRP,
    discount,
    hasDiscount,
    rawMRP: product?.mrp,
    rawPrice: product?.price,
    variants: product?.variants,
    variantMRP: product?.variants?.[0]?.mrp
  });

  return (
    <Card
      hover
      className={cn(
        "group relative p-3 sm:p-4",
        "transition-transform sm:hover:-translate-y-0.5",
        className
      )}
      onClick={() => navigate(`/product/${product._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product._id}`)}
      aria-label={`View ${product?.name || "product"}`}
    >
      {/* Stock badge + Discount badge */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 shadow-sm",
            inStock
              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
              : "bg-white text-slate-500 ring-black/10"
          )}
        >
          {inStock ? "In stock" : "Out of stock"}
        </span>
        
        {hasDiscount && (
          <span
            className="inline-flex items-center rounded-full bg-[#8E1B1B] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-[#8E1B1B]"
            aria-label={`${discount}% discount`}
          >
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Image */}
      <ProductImage
        src={img}
        alt={product?.name || "Product image"}
        aspect="fourFive"
        loading="lazy"
        imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        draggable="false"
      />

      {/* Info */}
      <div className="mt-3 sm:mt-4">
        <p className="text-[13px] sm:text-sm font-semibold text-[#0F172A] line-clamp-1">
          {product?.name}
        </p>
        
        {/* DEBUG: Show raw MRP data */}
        {(product?.mrp || product?.variants?.[0]?.mrp) && (
          <div className="mt-1 text-[9px] bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
            DEBUG: MRP={product?.mrp || product?.variants?.[0]?.mrp} | Price={product?.price || product?.variants?.[0]?.price} | hasDiscount={hasDiscount ? 'YES' : 'NO'}
          </div>
        )}

        {netQty ? (
          <p className="mt-1 text-[11px] sm:text-xs text-[#64748B]">
            Net Qty: <span className="font-semibold text-[#334155]">{netQty}</span>
          </p>
        ) : null}

        {count > 0 ? (
          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#64748B]">
            <span className="font-semibold text-[#0F172A] tabular-nums">{avg.toFixed(1)}</span>
            <span className="text-[#8E1B1B]" aria-label={`Rating ${avg.toFixed(1)} out of 5`}>
              {"★".repeat(Math.round(avg || 0))}
              <span className="text-[#CBD5E1]">
                {"★".repeat(Math.max(0, 5 - Math.round(avg || 0)))}
              </span>
            </span>
            <span className="tabular-nums">({count})</span>
          </div>
        ) : null}

        {description ? (
          <p className="mt-2 text-[11px] sm:text-xs text-[#64748B] line-clamp-2 leading-relaxed">
            {description}
          </p>
        ) : null}

        {/* Bottom row - Price area */}
        <div
          className="mt-4 flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] sm:text-base font-bold tabular-nums text-[#8E1B1B]">
                    {formatRs(displayPrice)}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#64748B] line-through tabular-nums">
                    {formatRs(displayMRP)}
                  </p>
                </div>
                <span
                  className="inline-flex items-center rounded-full bg-[#8E1B1B] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm w-fit"
                  aria-label={`${discount}% discount`}
                >
                  {discount}% OFF
                </span>
              </>
            ) : (
              <p className="text-[13px] sm:text-base font-semibold tabular-nums text-[#0F172A]">
                {formatRs(displayPrice)}
              </p>
            )}
          </div>

          <Button
            onClick={() => onAdd?.(product._id, variantLabel)}
            disabled={disabled || !inStock}
            className="h-10 px-4 text-[12px] sm:text-sm"
          >
            Add to cart
          </Button>
        </div>
      </div>
    </Card>
  );
}

