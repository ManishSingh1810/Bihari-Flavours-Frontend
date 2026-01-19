import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";

/* ---------------- Add To Cart Button ---------------- */
const AddToCartButton = ({ productId, onAdd, disabled, outOfStock }) => (
  <button
    type="button"
    onClick={() => !outOfStock && onAdd(productId)}
    disabled={disabled || outOfStock}
    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition
      ${
        outOfStock
          ? "cursor-not-allowed border-black/10 bg-white/60 text-gray-400"
          : "border-[#8E1B1B] bg-white text-[#8E1B1B] hover:bg-[#8E1B1B] hover:text-white"
      }`}
  >
    {outOfStock ? "Out of Stock" : disabled ? "Adding…" : "Add to Cart"}
  </button>
);

const QtyControls = ({ qty, onMinus, onPlus, disabled, outOfStock }) => (
  <div
    className={`inline-flex items-center overflow-hidden rounded-lg border text-sm font-semibold
      ${outOfStock ? "border-black/10 bg-white/60 text-gray-400" : "border-[rgba(142,27,27,0.35)] bg-white text-[#1F1B16]"}`}
  >
    <button
      type="button"
      onClick={onMinus}
      disabled={disabled || outOfStock}
      className="px-3 py-2 hover:bg-[#F8FAFC] disabled:opacity-50"
      aria-label="Decrease quantity"
    >
      -
    </button>
    <span className="min-w-[32px] text-center">{qty}</span>
    <button
      type="button"
      onClick={onPlus}
      disabled={disabled || outOfStock}
      className="px-3 py-2 hover:bg-[#F8FAFC] disabled:opacity-50"
      aria-label="Increase quantity"
    >
      +
    </button>
  </div>
);

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
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-[#1F1B16]">Our Products</h1>
          <p className="mt-2 text-sm text-[#6F675E]">
            Premium homemade snacks • Hygienic packing • Fast delivery
          </p>
        </div>

        {/* ✅ Search Bar */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-[rgba(142,27,27,0.25)]
                       bg-white px-4 py-3 text-sm text-[#1F1B16]
                       outline-none transition
                       focus:border-[#8E1B1B] focus:ring-2 focus:ring-[rgba(142,27,27,0.12)]"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => {
            const img =
              product?.photos?.[0] ||
              product?.photo ||
              "https://placehold.co/900x900/EEE/AAA?text=No+Image";

            const out = product?.quantity === "outofstock";
            const qty = cartItemsByProductId?.get(String(product._id)) || 0;

            return (
              <article
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="group cursor-pointer rounded-2xl border border-[rgba(142,27,27,0.18)]
                           bg-white p-3 shadow-sm transition-all
                           hover:-translate-y-0.5 hover:shadow-md sm:p-4"
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden rounded-xl border border-black/10 bg-white">
                  <div className="aspect-square w-full">
                    <img
                      src={img}
                      alt={product.name}
                      className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>

                  {/* Stock badge */}
                  <span
                    className={`absolute left-2 top-2 rounded-full border bg-white/90 px-2 py-1 text-[10px] font-semibold
                      ${
                        out
                          ? "border-gray-300 text-gray-500"
                          : "border-[rgba(142,27,27,0.35)] text-[#8E1B1B]"
                      }`}
                  >
                    {out ? "Out of stock" : "In stock"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-[#1F1B16] sm:text-base">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6F675E] sm:text-sm">
                  {product.desc}
                </p>

                {/* Price + CTA */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-[#8E1B1B] sm:text-lg">
                    ₹{product.price}
                  </span>

                  {/* Prevent card click when pressing button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    {qty > 0 ? (
                      <QtyControls
                        qty={qty}
                        outOfStock={out}
                        disabled={updating === product._id}
                        onMinus={() => handleMinus(product._id, qty)}
                        onPlus={() => handleAddToCart(product._id)}
                      />
                    ) : (
                      <AddToCartButton
                        productId={product._id}
                        onAdd={handleAddToCart}
                        disabled={updating === product._id}
                        outOfStock={out}
                      />
                    )}
                  </div>
                </div>
              </article>
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








