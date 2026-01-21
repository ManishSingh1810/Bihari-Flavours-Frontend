import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  ShieldCheck,
  Truck,
  Star,
} from "lucide-react";
import QtyStepper from "./product/QtyStepper.jsx";
import ProductCard from "./product/ProductCard.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatRs(amount) {
  if (amount == null || amount === "") return "";
  return `Rs. ${amount}`;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { cartItemsByProductId, addToCart, setCartQuantity } = useUser();

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

    setUpdating(true);
    try {
      const res = await addToCart(product._id);
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
      toast.error(e?.response?.data?.message || "Failed to add to cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleMinus = async () => {
    if (!product) return;
    const currentQty = cartItemsByProductId?.get(String(product._id)) || 0;
    const nextQty = Math.max(0, (Number(currentQty) || 0) - 1);
    setUpdating(true);
    try {
      const res = await setCartQuantity(product._id, nextQty);
      if (!res?.success) throw new Error("Failed to update cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(e?.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        Product not found
      </div>
    );
  }

  const netQuantity = product.netQuantity || product.weight || product.size || "";
  const shelfLife = product.shelfLife || "";
  const ingredients = product.ingredients || "";
  const storage = product.storage || "Store in a cool, dry place";
  const country = product.country || "India";
  const deliveryEstimate = "Delivered in 2–5 days (estimated)";

  const qty = cartItemsByProductId?.get(String(product._id)) || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 py-24 pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#6F675E] hover:text-[#1F1B16]"
          >
            ← Back
          </button>

          <Button variant="secondary" onClick={shareOnWhatsApp}>
            <Share2 size={16} /> Share
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* GALLERY */}
          <Card className="p-4" hover={false}>
            <div
              className="relative overflow-hidden rounded-2xl bg-[#F8FAFC] ring-1 ring-black/5"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="aspect-square w-full">
                <img
                  src={images[active]}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                  draggable="false"
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-[#0F172A] ring-1 ring-black/10 hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-[#0F172A] ring-1 ring-black/10 hover:bg-white"
                    aria-label="Next image"
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
                        aria-label={`Go to image ${i + 1}`}
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
                    className={`shrink-0 overflow-hidden rounded-xl bg-white ring-1
                      ${
                        idx === active
                          ? "ring-[rgba(142,27,27,0.45)]"
                          : "ring-black/5 hover:ring-black/10"
                      }`}
                    style={{ width: 76, height: 76 }}
                    aria-label={`Select image ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-contain p-2"
                      draggable="false"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* DETAILS */}
          <Card className="p-6" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {/* Title */}
                <h1 className="text-3xl font-semibold text-[#1F1B16]">
                  {product.name}
                </h1>

                {/* Price (moved up, directly under title) */}
                <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2">
                  <p className="text-3xl font-semibold tabular-nums text-[#8E1B1B]">
                    {formatRs(product.price)}
                  </p>
                  {netQuantity ? (
                    <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#334155] ring-1 ring-black/5">
                      {netQuantity}
                    </span>
                  ) : null}
                </div>

                {/* Description (moved after price) */}
                <p className="mt-3 text-sm leading-relaxed text-[#6F675E]">
                  {product.desc}
                </p>

                {/* Delivery / trust row */}
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2 rounded-2xl bg-[#F8FAFC] p-3 ring-1 ring-black/5">
                    <Truck className="mt-0.5 h-4 w-4 text-[#8E1B1B]" />
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">Delivery</p>
                      <p className="text-xs text-[#64748B]">{deliveryEstimate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-2xl bg-[#F8FAFC] p-3 ring-1 ring-black/5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-[#8E1B1B]" />
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">Quality promise</p>
                      <p className="text-xs text-[#64748B]">Hygienic packing • Fresh batch</p>
                    </div>
                  </div>
                </div>
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

            {/* Add to cart row (price already shown above) */}
            <div className="mt-6 flex items-center justify-end border-t border-black/5 pt-6">
              {qty > 0 ? (
                <QtyStepper
                  qty={qty}
                  outOfStock={isOutOfStock}
                  disabled={updating}
                  onMinus={handleMinus}
                  onPlus={handleAddToCart}
                />
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={updating || isOutOfStock}
                  className="w-full sm:w-auto px-6 py-3"
                >
                  {isOutOfStock ? "Out of Stock" : updating ? "Adding…" : "Add to cart"}
                </Button>
              )}
            </div>

            {/* Product Information (kept before reviews) */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] p-4">
              <h3 className="font-semibold text-[#1F1B16]">
                Product Information
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                {netQuantity ? <InfoRow label="Net Quantity" value={netQuantity} /> : null}
                {shelfLife ? <InfoRow label="Shelf Life" value={shelfLife} /> : null}
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

            {/* Reviews (placeholder-style header; uses existing endpoint if available) */}
            <div className="mt-6 rounded-xl bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1F1B16]">Reviews</h3>
                <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                  <Star className="h-4 w-4 text-[#8E1B1B]" /> Coming soon
                </span>
              </div>
              <p className="text-sm text-[#6F675E] mt-1">
                Ratings & reviews will appear here once customers start sharing feedback.
              </p>

              <ReviewBox productId={product._id} />
            </div>
          </Card>
        </div>

        {/* Frequently bought together */}
        <div className="mt-12">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#1F1B16]">
              Frequently bought together
            </h2>
            <button
              type="button"
              onClick={async () => {
                const picks = related.slice(0, 3);
                if (!picks.length) return;
                try {
                  for (const p of picks) {
                    if (p?.quantity === "outofstock") continue;
                    // eslint-disable-next-line no-await-in-loop
                    await addToCart(p._id);
                  }
                  showActionToast({
                    title: "Added bundle to cart",
                    message: "Items added successfully.",
                    actionLabel: "View cart",
                    onAction: () => navigate("/cart"),
                    duration: 3000,
                  });
                } catch {
                  toast.error("Could not add bundle to cart");
                }
              }}
              className="rounded-xl bg-[#8E1B1B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#741616]"
            >
              Add bundle
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 4).map((p) => {
              const q = cartItemsByProductId?.get(String(p._id)) || 0;
              return (
                <ProductCard
                  key={p._id}
                  product={p}
                  qty={q}
                  disabled={updating}
                  onAdd={() => addToCart(p._id)}
                  onMinus={(productId, currentQty) =>
                    setCartQuantity(productId, Math.max(0, (Number(currentQty) || 0) - 1))
                  }
                />
              );
            })}
          </div>
        </div>

        {/* You may also like */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-[#1F1B16] mb-4">
            You may also like
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => {
              const q = cartItemsByProductId?.get(String(p._id)) || 0;
              return (
                <ProductCard
                  key={p._id}
                  product={p}
                  qty={q}
                  disabled={updating}
                  onAdd={() => addToCart(p._id)}
                  onMinus={(productId, currentQty) =>
                    setCartQuantity(productId, Math.max(0, (Number(currentQty) || 0) - 1))
                  }
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* STICKY ADD TO CART BAR (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-[rgba(142,27,27,0.18)] p-3 sm:hidden">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#6F675E]">Total</p>
            <p className="text-lg font-semibold tabular-nums text-[#8E1B1B]">Rs. {product.price}</p>
          </div>

          {qty > 0 ? (
            <div className="flex-1 flex justify-end">
              <QtyStepper
                qty={qty}
                outOfStock={isOutOfStock}
                disabled={updating}
                onMinus={handleMinus}
                onPlus={handleAddToCart}
              />
            </div>
          ) : (
          <button
            onClick={handleAddToCart}
              disabled={updating || isOutOfStock}
            className="flex-1 rounded-lg bg-[#8E1B1B] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
              {isOutOfStock ? "Out of Stock" : updating ? "Adding…" : "Add to Cart"}
          </button>
          )}
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
        <p className="text-sm font-medium text-[#1F1B16] mb-2">
          Rate this product
        </p>

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
          className="mt-3 w-full rounded-lg border border-black/10 bg-[#F8FAFC] p-3 text-sm outline-none focus:border-[#8E1B1B]"
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
        <p className="text-sm font-medium text-[#1F1B16] mb-3">
          Customer reviews
        </p>

        {loading ? (
          <p className="text-sm text-[#6F675E]">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[#6F675E]">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-lg bg-[#F8FAFC] p-3">
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
