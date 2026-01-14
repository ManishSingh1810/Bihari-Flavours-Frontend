import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  Package,
} from "lucide-react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // gallery
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
        const [pRes, listRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products`),
        ]);

        if (!pRes.data.success) throw new Error("Failed to load product");
        setProduct(pRes.data.product);

        if (listRes.data.success) setAllProducts(listRes.data.products || []);

        setActive(0);
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) return logoutUser();
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

  // swipe
  const onTouchStart = (e) => (touchStartX.current = e.touches?.[0]?.clientX ?? null);
  const onTouchEnd = (e) => {
    const startX = touchStartX.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX == null || endX == null) return;

    const dx = endX - startX;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? nextImg() : prevImg();
    touchStartX.current = null;
  };

  // WhatsApp share
  const shareOnWhatsApp = () => {
    if (!product) return;
    const url = window.location.href;
    const text = `Check out ${product.name} on Bihari Flavours: ${url}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank");
  };

  // rating placeholder (later connect DB)
  const rating = product?.rating ?? 4.6;
  const reviewCount = product?.reviewCount ?? 128;

  // related products (exclude current)
  const related = useMemo(() => {
    const list = (allProducts || []).filter((p) => p._id !== id);

    // If you have category in DB, prefer same category:
    if (product?.category) {
      const sameCat = list.filter((p) => p.category === product.category);
      return (sameCat.length ? sameCat : list).slice(0, 4);
    }

    // else just show first 4 (already sorted by newest)
    return list.slice(0, 4);
  }, [allProducts, id, product]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (isOutOfStock) return toast.error("This product is currently out of stock");

    setAdding(true);
    try {
      const res = await api.post("/cart", { productId: product._id });
      if (!res.data.success) throw new Error("Add to cart failed");
      toast.success("Added to cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
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

  const netQuantity = product.netQuantity || "—";
  const shelfLife = product.shelfLife || "—";
  const ingredients = product.ingredients || "";
  const storage = product.storage || "Store in a cool, dry place";
  const country = product.country || "India";

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 sm:px-6 py-24 pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#6F675E] hover:text-[#1F1B16]"
          >
            ← Back
          </button>

          <button
            onClick={shareOnWhatsApp}
            className="inline-flex items-center gap-2 rounded-md border border-[rgba(142,27,27,0.35)]
                       bg-[#FAF7F2] px-3 py-2 text-sm text-[#8E1B1B]
                       hover:bg-[#8E1B1B] hover:text-white"
          >
            <Share2 size={16} /> Share
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* GALLERY */}
          <div className="rounded-2xl border border-[rgba(142,27,27,0.25)] bg-[#F3EFE8] p-4">
            <div
              className="relative overflow-hidden rounded-xl bg-white"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="aspect-square w-full">
                <img
                  src={images[active]}
                  alt={product.name}
                  className="h-full w-full object-contain p-3"
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

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`h-2.5 w-2.5 rounded-full ${
                          i === active ? "bg-[#8E1B1B]" : "bg-black/20"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

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
          </div>

          {/* DETAILS */}
          <div className="rounded-2xl border border-[rgba(142,27,27,0.25)] bg-[#F3EFE8] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-[#1F1B16]">
                  {product.name}
                </h1>

                {/* REVIEWS */}
<div className="mt-6 rounded-xl bg-[#FAF7F2] p-4">
  <h3 className="font-semibold text-[#1F1B16]">Reviews</h3>
  <p className="text-sm text-[#6F675E] mt-1">
    Share your experience to help others.
  </p>

  <ReviewBox productId={product._id} />
</div>


                {/* Rating placeholder */}
                {/* <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-[#8E1B1B]">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold">{rating}</span>
                  </div>
                  <span className="text-[#6F675E]">({reviewCount} reviews)</span>
                  <span className="text-[#6F675E]">•</span>
                  <span className="text-[#6F675E]">Trusted snack brand</span>
                </div> */}

                <p className="mt-3 text-sm text-[#6F675E]">
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

            {/* badges */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Badge icon={<ShieldCheck size={16} />} text="Hygienic packing" />
              <Badge icon={<Truck size={16} />} text="Fast delivery" />
              <Badge icon={<Package size={16} />} text="Quality checked" />
            </div>

            {/* info */}
            <div className="mt-6 rounded-xl bg-[#FAF7F2] p-4">
              <h3 className="font-semibold text-[#1F1B16]">Product Information</h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                <InfoRow label="Net Quantity" value={netQuantity} />
                <InfoRow label="Shelf Life" value={shelfLife} />
                <InfoRow label="Storage" value={storage} />
                <InfoRow label="Country of Origin" value={country} />
              </div>

              {!!ingredients && (
                <div className="mt-4 text-sm">
                  <p className="font-medium text-[#1F1B16]">Ingredients</p>
                  <p className="text-[#6F675E] mt-1">{ingredients}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-[#1F1B16] mb-4">
            You may also like
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => {
              const img = p.photos?.[0] || p.photo || "https://placehold.co/600x600/EEE/AAA?text=No+Image";
              const out = p.quantity === "outofstock";

              return (
                <button
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="text-left rounded-xl border border-[rgba(142,27,27,0.25)]
                             bg-[#F3EFE8] p-4 hover:bg-[#FAF7F2]"
                >
                  <div className="aspect-square w-full bg-white rounded-lg overflow-hidden">
                    <img src={img} alt={p.name} className="h-full w-full object-contain p-2" />
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#1F1B16] line-clamp-1">{p.name}</p>
                      <p className="text-sm text-[#8E1B1B] font-semibold">₹{p.price}</p>
                    </div>
                    <span
                      className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] ${
                        out ? "border-gray-300 text-gray-500" : "border-[rgba(142,27,27,0.35)] text-[#8E1B1B]"
                      }`}
                    >
                      {out ? "Out" : "In stock"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* STICKY ADD TO CART BAR (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F2]/95 backdrop-blur border-t border-[rgba(142,27,27,0.25)] p-3 sm:hidden">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#6F675E]">Total</p>
            <p className="text-lg font-semibold text-[#8E1B1B]">₹{product.price}</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            className="flex-1 rounded-lg bg-[#8E1B1B] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isOutOfStock ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
          </button>
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

function Badge({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#FAF7F2] p-3 text-xs text-[#6F675E]">
      <span className="text-[#8E1B1B]">{icon}</span>
      {text}
    </div>
  );
}

function ReviewBox({ productId }) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}/reviews`);
      if (res.data.success) setReviews(res.data.reviews || []);
    } catch (e) {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [productId]);

  const submitReview = async () => {
    if (!user) {
      toast.error("Please login to write a review");
      return;
    }
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a short review");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/products/${productId}/reviews`, {
        rating,
        comment: comment.trim(),
      });

      if (!res.data.success) throw new Error(res.data.message);

      toast.success("Thanks! Your review was submitted.");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Rate */}
      <div className="rounded-lg border border-black/10 bg-white p-4">
        <p className="text-sm font-medium text-[#1F1B16] mb-2">Rate this product</p>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`h-10 w-10 rounded-lg border text-lg ${
                rating >= n
                  ? "border-[#8E1B1B] bg-[#8E1B1B] text-white"
                  : "border-black/10 bg-white text-[#6F675E]"
              }`}
              aria-label={`${n} star`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review (taste, packaging, delivery, etc.)"
          rows={3}
          className="mt-3 w-full rounded-lg border border-black/10 bg-[#FAF7F2] p-3 text-sm outline-none focus:border-[#8E1B1B]"
        />

        <button
          type="button"
          onClick={submitReview}
          disabled={submitting}
          className="mt-3 rounded-lg bg-[#8E1B1B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      {/* Show reviews */}
      <div className="rounded-lg border border-black/10 bg-white p-4">
        <p className="text-sm font-medium text-[#1F1B16] mb-3">Customer reviews</p>

        {loading ? (
          <p className="text-sm text-[#6F675E]">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[#6F675E]">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-lg bg-[#FAF7F2] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1F1B16]">
                    {r.userName || "Customer"}
                  </p>
                  <p className="text-sm text-[#8E1B1B] font-semibold">
                    {"★".repeat(r.rating)}
                    <span className="text-[#6F675E] font-normal">
                      {"★".repeat(5 - r.rating)}
                    </span>
                  </p>
                </div>
                <p className="text-sm text-[#6F675E] mt-2">{r.comment}</p>
                <p className="text-[11px] text-[#6F675E] mt-2">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

