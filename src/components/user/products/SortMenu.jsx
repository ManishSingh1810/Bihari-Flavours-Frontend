import React from "react";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function SortMenu({ value, onChange, className = "" }) {
  return (
    <label className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="hidden lg:inline text-xs font-semibold text-[#64748B]">
        Sort
      </span>
      <select
        className="h-11 w-full rounded-2xl bg-[#F8FAFC] px-3 text-sm text-[#0F172A]
                   ring-1 ring-black/10 outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

