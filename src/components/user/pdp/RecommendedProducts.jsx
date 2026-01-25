import React from "react";
import Button from "../../ui/Button.jsx";
import ProductCard from "../product/ProductCard.jsx";

export default function RecommendedProducts({
  title = "You may also like",
  products = [],
  cartItemsByProductId,
  updating,
  onAdd,
  onMinus,
  variant = "grid", // "grid" | "scroll"
}) {
  const list = Array.isArray(products) ? products.slice(0, 4) : [];

  if (!list.length) return null;

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#0F172A]">{title}</h2>
      </div>

      {variant === "scroll" ? (
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
          {list.map((p) => {
            return (
              <div key={p._id} className="min-w-[260px]">
                <ProductCard
                  product={p}
                  disabled={updating}
                  onAdd={() => onAdd(p._id)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => {
            return (
              <ProductCard
                key={p._id}
                product={p}
                disabled={updating}
                onAdd={() => onAdd(p._id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

