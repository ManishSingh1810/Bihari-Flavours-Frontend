import React from "react";
import { Minus, Plus } from "lucide-react";

export default function QtyStepper({
  qty,
  onMinus,
  onPlus,
  disabled,
  outOfStock,
  size = "md", // "sm" | "md"
}) {
  const btn = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const pad = size === "sm" ? "min-w-[34px]" : "min-w-[40px]";

  return (
    <div
      className={[
        "inline-flex items-center overflow-hidden rounded-xl bg-white",
        "ring-1 ring-black/10 shadow-sm",
        outOfStock ? "opacity-60" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onMinus}
        disabled={disabled || outOfStock}
        className={`inline-flex ${btn} items-center justify-center hover:bg-[#F8FAFC] disabled:opacity-50`}
        aria-label="Decrease quantity"
      >
        <Minus className={icon} />
      </button>
      <span className={`${pad} text-center text-sm font-bold tabular-nums text-[#0F172A]`}>
        {qty}
      </span>
      <button
        type="button"
        onClick={onPlus}
        disabled={disabled || outOfStock}
        className={`inline-flex ${btn} items-center justify-center hover:bg-[#F8FAFC] disabled:opacity-50`}
        aria-label="Increase quantity"
      >
        <Plus className={icon} />
      </button>
    </div>
  );
}

