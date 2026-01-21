import React from "react";
import Input from "../../ui/Input.jsx";
import SortMenu from "./SortMenu.jsx";
import Button from "../../ui/Button.jsx";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function FilterBar({
  mode = "desktop", // "desktop" | "mobileBar" | "sheet"
  categories = [],
  search,
  setSearch,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  sort,
  setSort,
  onOpenMobile,
  onReset,
}) {
  const categoryOptions = ["All", ...categories.filter(Boolean)];

  const categorySelect = (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-[#64748B]">Category</span>
      <select
        className="h-11 rounded-2xl bg-[#F8FAFC] px-3 text-sm text-[#0F172A]
                   ring-1 ring-black/10 outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Filter by category"
      >
        {categoryOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );

  const priceInputs = (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-[#64748B]">Min</span>
        <input
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
          className="h-11 rounded-2xl bg-[#F8FAFC] px-3 text-sm text-[#0F172A]
                     ring-1 ring-black/10 outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]"
          aria-label="Minimum price"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-[#64748B]">Max</span>
        <input
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="9999"
          className="h-11 rounded-2xl bg-[#F8FAFC] px-3 text-sm text-[#0F172A]
                     ring-1 ring-black/10 outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]"
          aria-label="Maximum price"
        />
      </label>
    </div>
  );

  const stockToggle = (
    <label className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] px-3 py-3 ring-1 ring-black/10">
      <input
        type="checkbox"
        checked={inStockOnly}
        onChange={(e) => setInStockOnly(e.target.checked)}
        className="h-4 w-4 accent-[#8E1B1B]"
      />
      <span className="text-sm font-semibold text-[#0F172A]">In stock only</span>
    </label>
  );

  if (mode === "mobileBar") {
    return (
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={onOpenMobile} className="h-11 px-4">
          Filters
        </Button>
        <SortMenu value={sort} onChange={setSort} className="flex-1" />
      </div>
    );
  }

  if (mode === "sheet") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-[#64748B] mb-2">Search</p>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
        </div>
        {categorySelect}
        <div>
          <p className="text-xs font-semibold text-[#64748B] mb-2">Price range</p>
          {priceInputs}
        </div>
        {stockToggle}
        <div>
          <p className="text-xs font-semibold text-[#64748B] mb-2">Sort</p>
          <SortMenu value={sort} onChange={setSort} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={onOpenMobile} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    );
  }

  // desktop
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
        />
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-2">{categorySelect}</div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#64748B]">Price</span>
          {priceInputs}
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#64748B]">Availability</span>
          {stockToggle}
        </div>
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-1">
        <SortMenu value={sort} onChange={setSort} />
      </div>

      <div className="col-span-12 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className={cn(
            "text-sm font-semibold text-[#64748B] hover:text-[#0F172A]",
            "focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)] rounded-lg px-2 py-1"
          )}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}

