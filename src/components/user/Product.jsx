import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import { ArrowRight } from "lucide-react";
import ProductCard from "./product/ProductCard.jsx";
import Input from "../ui/Input.jsx";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  // ✅ Search
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();

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

  // ✅ Filtered products (safe + fast)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((p) => {
      const name = (p?.name || "").toLowerCase();
      const desc = (p?.desc || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [items, search]);

  const handleAddToCart = async (productId) => {
    const product = items.find((p) => p._id === productId);

    if (product?.quantity === "outofstock") {
      toast.error("This product is currently out of stock");
      return;
    }

    setUpdating(productId);
    try {
      const res = await addToCart(productId);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
        <p className="text-[#8E1B1B]">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium header */}
      <div className="border-b border-black/5 bg-white pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-10 sm:py-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8E1B1B]">
                  Shop
                </p>
                <h1 className="mt-2 text-3xl sm:text-4xl text-[#0F172A]">
                  Our Products
                </h1>
                <p className="mt-2 text-sm text-[#64748B]">
                  Thekua • Chana Sattu (Classic + Jaljeera) • Chiwda Mixture • Banana Chips • Nimki • Makhana
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Back to Home <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="mt-6">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => {
            const out = product?.quantity === "outofstock";
            const qty = cartItemsByProductId?.get(String(product._id)) || 0;

            return (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <ProductCard
                  product={product}
                  qty={qty}
                  disabled={updating === product._id}
                  onAdd={() => handleAddToCart(product._id)}
                  onMinus={(productId, currentQty) => handleMinus(productId, currentQty)}
                  showQuickAdd={!out}
                />
              </div>
            );
          })}
        </div>

        {/* ✅ Empty state should check filtered */}
        {filtered.length === 0 && (
          <div className="mt-14 text-center text-sm text-[#6F675E]">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}








