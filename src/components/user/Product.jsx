import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import ProductCard from "./product/ProductCard.jsx";
import FilterBar from "./products/FilterBar.jsx";
import MobileFilterSheet from "./products/MobileFilterSheet.jsx";
import SkeletonCard from "./products/SkeletonCard.jsx";
import Button from "../ui/Button.jsx";
import { getDefaultVariantLabel, getVariantByLabel } from "../../utils/variants.js";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  // ✅ Search
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();

  // Filters / sort (client-side only)
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("displayOrder");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const navigate = useNavigate();
  const { cartItemsByProductId, addToCart, setCartQuantity } = useUser();

  const logoutUser = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await api.get("/products");
        if (!res.data.success) throw new Error("Failed to fetch products");
        setItems(res.data.products || []);
        setError("");
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) return logoutUser();
        setError(e?.response?.data?.message || e?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Sync search from query param (?q=)
  useEffect(() => {
    const q = (searchParams.get("q") || "").trim();
    setSearch(q);
  }, [searchParams]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const p of items || []) {
      const c = p?.category;
      const label = typeof c === "string" ? c : c?.name;
      if (label) set.add(String(label));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  // ✅ Filter + sort (client-side only)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    let list = (items || []).filter((p) => {
      // search
      if (q) {
        const name = String(p?.name || "").toLowerCase();
        const desc = String(p?.desc || "").toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }

      // category
      if (category && category !== "All") {
        const c = p?.category;
        const label = typeof c === "string" ? c : c?.name;
        if (String(label || "").toLowerCase() !== String(category).toLowerCase()) return false;
      }

      // in-stock toggle
      if (inStockOnly && p?.quantity === "outofstock") return false;

      // price range
      const price = Number(p?.price);
      if (Number.isFinite(min) && Number.isFinite(price) && price < min) return false;
      if (Number.isFinite(max) && Number.isFinite(price) && price > max) return false;

      return true;
    });

    // sort
    if (sort === "displayOrder" || sort === "featured") {
      list = [...list].sort((a, b) => Number(a?.displayOrder ?? 9999) - Number(b?.displayOrder ?? 9999));
    } else if (sort === "newest") {
      list = [...list].sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    } else if (sort === "price_asc") {
      list = [...list].sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    } else if (sort === "price_desc") {
      list = [...list].sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    }

    return list;
  }, [items, search, category, minPrice, maxPrice, inStockOnly, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSort("featured");
  };

  const handleAddToCart = async (productId, variantLabel = "") => {
    const product = items.find((p) => p._id === productId);

    const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
    const vLabel = hasVariants ? String(variantLabel || getDefaultVariantLabel(product) || "") : "";
    if (hasVariants) {
      const v = getVariantByLabel(product.variants, vLabel) || product.variants[0];
      if (Number(v?.stock ?? 0) === 0) {
        toast.error("This variant is currently out of stock");
        return;
      }
    } else if (product?.quantity === "outofstock") {
      toast.error("This product is currently out of stock");
      return;
    }

    setUpdating(`${String(productId)}::${String(vLabel || "")}`);
    try {
      const res = await addToCart(productId, vLabel);
      if (!res?.success) throw new Error("Add to cart failed");
      showActionToast({
        title: "Added to cart",
        message: "Item added successfully.",
        actionLabel: "View cart",
        onAction: () => navigate("/cart"),
        duration: 3000,
      });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(e?.response?.data?.message || e?.message || "Failed to add to cart");
    } finally {
      setUpdating(null);
    }
  };

  const handleMinus = async (productId, currentQty) => {
    const nextQty = Math.max(0, (Number(currentQty) || 0) - 1);
    setUpdating(productId);
    try {
      const res = await setCartQuantity(productId, nextQty);
      if (!res?.success) throw new Error("Failed to update cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(e?.response?.data?.message || e?.message || "Failed to update cart");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Page header */}
      <div className="bg-white border-b border-black/5 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-8 sm:py-10">
            <nav className="text-sm text-[#64748B]" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="hover:text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)] rounded-md px-1"
                  >
                    Home
                  </button>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-[#0F172A] font-semibold">Shop</li>
              </ol>
            </nav>

            <div className="mt-3 flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl text-[#0F172A]">Shop</h1>
              <p className="text-sm text-[#64748B] max-w-2xl">
                Premium snacks & staples crafted with care — hygienic, fresh, and delivered fast.
              </p>
            </div>

            <div className="mt-6 border-t border-black/5" />
          </div>
        </div>
      </div>

      {/* Sticky filter bars */}
      <div className="hidden md:block sticky top-20 z-30 bg-white border-b border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <FilterBar
            mode="desktop"
            categories={categories}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            sort={sort}
            setSort={setSort}
            onReset={resetFilters}
          />
        </div>
      </div>
      <div className="md:hidden sticky top-20 z-30 bg-white border-b border-black/5">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <FilterBar
            mode="mobileBar"
            categories={categories}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            sort={sort}
            setSort={setSort}
            onOpenMobile={() => setMobileFiltersOpen(true)}
            onReset={resetFilters}
          />
        </div>
      </div>

      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        sort={sort}
        setSort={setSort}
        onReset={resetFilters}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Trust strip */}
        <div className="mb-6 rounded-2xl bg-white ring-1 ring-black/5 px-4 py-3 text-sm text-[#475569]">
          <span className="font-semibold text-[#0F172A]">Hygienic Packing</span> •{" "}
          Fast Dispatch • Secure Payments
        </div>

        {/* Error banner */}
        {error ? (
          <div className="mb-6 rounded-2xl bg-white ring-1 ring-black/5 p-4">
            <p className="text-sm text-[#8E1B1B]">{error}</p>
          </div>
        ) : null}

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((product) => {
                const vLabel = getDefaultVariantLabel(product);
                const key = `${String(product?._id)}::${String(vLabel || "")}`;
                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    disabled={updating === key}
                    onAdd={handleAddToCart}
                  />
                );
              })}
        </div>

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="mt-10 rounded-3xl bg-white ring-1 ring-black/5 p-8 text-left">
            <p className="ds-eyebrow">No results</p>
            <h2 className="ds-title mt-2">We couldn’t find matching products.</h2>
            <p className="ds-body mt-2 max-w-xl">
              Try adjusting filters, widening the price range, or clearing the search term.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={resetFilters}>
                Reset filters
              </Button>
              <Button variant="ghost" onClick={() => setMobileFiltersOpen(true)} className="md:hidden">
                Open filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}








