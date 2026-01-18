import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(null);

  // ✅ Search
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

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

    setAdding(productId);
    try {
      const res = await api.post("/cart", { productId });
      if (!res.data.success) throw new Error("Add to cart failed");
      toast.success("Added to cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(e?.response?.data?.message || e?.message || "Failed to add to cart");
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] px-6">
        <p className="text-[#8E1B1B]">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-24 sm:px-6">
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

            return (
              <article
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="group cursor-pointer rounded-2xl border border-[rgba(142,27,27,0.18)]
                           bg-[#F3EFE8] p-3 shadow-sm transition-all
                           hover:-translate-y-0.5 hover:bg-[#FAF7F2] hover:shadow-md sm:p-4"
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
                    <AddToCartButton
                      productId={product._id}
                      onAdd={handleAddToCart}
                      disabled={adding === product._id}
                      outOfStock={out}
                    />
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








