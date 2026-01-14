import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Package, ShieldCheck, Truck } from "lucide-react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gallery
  const [active, setActive] = useState(0);
  const touchStartX = useRef(null);

  const logoutUser = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`); // needs backend route
        if (!res.data.success) throw new Error("Failed to load product");
        setProduct(res.data.product);
        setActive(0);
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) return logoutUser();
        toast.error(e?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    const arr =
      Array.isArray(product.photos) && product.photos.length > 0
        ? product.photos
        : product.photo
        ? [product.photo]
        : [];
    return arr.length ? arr : ["https://placehold.co/900x900/EEE/AAA?text=No+Image"];
  }, [product]);

  const isOutOfStock = product?.quantity === "outofstock";

  const nextImg = () => setActive((i) => (i + 1) % images.length);
  const prevImg = () => setActive((i) => (i - 1 + images.length) % images.length);

  // Simple swipe (mobile)
  const onTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    const startX = touchStartX.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX == null || endX == null) return;

    const dx = endX - startX;
    if (Math.abs(dx) < 40) return; // swipe threshold
    if (dx < 0) nextImg();
    else prevImg();

    touchStartX.current = null;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    setAdding(true);
    try {
      const res = await api.post("/cart", { productId: product._id });
      if (!res.data.success) throw new Error("Add to cart failed");
      toast.success("Added to cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) return logoutUser();
      toast.error(e?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        Product not found
      </div>
    );
  }

  // Optional new fields (show only if present)
  const netQuantity = product.netQuantity || product.netQty;
  const shelfLife = product.shelfLife;
  const ingredients = product.ingredients;
  const storage = product.storage;

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 sm:px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-[#6F675E] hover:text-[#1F1B16]"
        >
          ← Back
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ===== LEFT: GALLERY ===== */}
          <div className="rounded-2xl border border-[rgba(142,27,27,0.25)] bg-[#F3EFE8] p-4">
            <div
              className="relative overflow-hidden rounded-xl bg-white"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Fixed square ratio so all images look consistent */}
              <div className="aspect-square w-full">
                <img
                  src={images[active]}
                  alt={product.name}
                  className="h-full w-full object-contain p-2"
                  draggable="false"
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/55"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/55"
                  >
                    <ChevronRight />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`h-2.5 w-2.5 rounded-full ${
                          i === active ? "bg-[#8E1B1B]" : "bg-black/20"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className={`shrink-0 overflow-hidden rounded-lg border bg-white
                      ${idx === active ? "border-[#8E1B1B]" : "border-transparent hover:border-[rgba(142,27,27,0.3)]"}`}
                    style={{ width: 76, height: 76 }}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-[#6F675E]">
              Tip: On mobile, swipe left/right to change images.
            </p>
          </div>

          {/* ===== RIGHT: DETAILS ===== */}
          <div className="rounded-2xl border border-[rgba(142,27,27,0.25)] bg-[#F3EFE8] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-[#1F1B16]">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm text-[#6F675E]">
                  {product.desc}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                  isOutOfStock
                    ? "border-gray-300 text-gray-500"
                    : "border-[rgba(142,27,27,0.35)] text-[#8E1B1B]"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-6">
              <div className="text-3xl font-semibold text-[#8E1B1B]">
                ₹{product.price}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="rounded-md border border-[#8E1B1B] px-6 py-2 text-sm text-[#8E1B1B]
                           hover:bg-[#8E1B1B] hover:text-white disabled:opacity-50"
              >
                {isOutOfStock ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg bg-[#FAF7F2] p-3 text-xs text-[#6F675E]">
                <ShieldCheck size={16} className="text-[#8E1B1B]" />
                Hygienic packing
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#FAF7F2] p-3 text-xs text-[#6F675E]">
                <Truck size={16} className="text-[#8E1B1B]" />
                Fast delivery
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#FAF7F2] p-3 text-xs text-[#6F675E]">
                <Package size={16} className="text-[#8E1B1B]" />
                Quality checked
              </div>
            </div>

            {/* Product info */}
            <div className="mt-6 rounded-xl bg-[#FAF7F2] p-4">
              <h3 className="font-semibold text-[#1F1B16]">Product Information</h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                <InfoRow label="Net Quantity" value={netQuantity || "—"} />
                <InfoRow label="Shelf Life" value={shelfLife || "—"} />
                <InfoRow label="Storage" value={storage || "Store in a cool, dry place"} />
                <InfoRow label="Country of Origin" value={product.country || "India"} />
              </div>

              {ingredients && (
                <div className="mt-4 text-sm">
                  <p className="font-medium text-[#1F1B16]">Ingredients</p>
                  <p className="text-[#6F675E] mt-1">{ingredients}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-2">
      <span className="text-[#6F675E]">{label}</span>
      <span className="font-medium text-[#1F1B16] text-right">{value}</span>
    </div>
  );
}
