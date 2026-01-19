import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const SearchIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export default function HeaderSearch({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const initialQ = useMemo(() => params.get("q") || "", [params]);
  const [q, setQ] = useState(initialQ);

  // keep input in sync when user navigates /product?q=...
  useEffect(() => {
    setQ(initialQ);
  }, [initialQ, location.pathname]);

  const submit = (e) => {
    e?.preventDefault?.();
    const next = q.trim();
    navigate(next ? `/product?q=${encodeURIComponent(next)}` : "/product");
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Desktop search input */}
      <form onSubmit={submit} className="hidden md:flex items-center">
        <div
          className="flex items-center gap-2 rounded-xl border border-[rgba(142,27,27,0.2)]
                     bg-white px-3 py-2 text-sm text-[#1F1B16]
                     focus-within:border-[#8E1B1B] focus-within:ring-2 focus-within:ring-[rgba(142,27,27,0.12)]"
        >
          <SearchIcon className="text-[#6F675E]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-56 bg-transparent outline-none placeholder:text-[#9A948C]"
          />
        </div>
      </form>

      {/* Mobile icon */}
      <button
        type="button"
        onClick={() => navigate("/product")}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg
                   border border-transparent text-[#1F1B16]
                   hover:border-[rgba(142,27,27,0.25)] hover:text-[#8E1B1B] transition"
        aria-label="Search"
      >
        <SearchIcon />
      </button>
    </div>
  );
}

