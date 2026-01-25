import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import Card from "../../ui/Card.jsx";
import Button from "../../ui/Button.jsx";
import { Star } from "lucide-react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="text-[#8E1B1B]">
      {"★".repeat(v)}
      <span className="text-[#CBD5E1]">{"★".repeat(5 - v)}</span>
    </span>
  );
}

function getLocation(r) {
  const raw =
    r?.city ||
    r?.location ||
    r?.userCity ||
    r?.userLocation ||
    r?.address?.city ||
    r?.user?.city ||
    r?.user?.location ||
    "";
  return String(raw || "").trim();
}

function StarPicker({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const display = hover || value || 0;

  const set = (n) => {
    if (disabled) return;
    // click same rating again to clear (easy unselect)
    onChange(n === value ? 0 : n);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className={cn(
        "flex items-center gap-1 rounded-2xl bg-[#F8FAFC] p-2 ring-1 ring-black/10",
        disabled && "opacity-60"
      )}
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = n <= display;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            disabled={disabled}
            onClick={() => set(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl transition",
              "focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]",
              "hover:bg-white",
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            )}
            aria-label={`${n} star`}
          >
            <Star
              className={cn(
                "h-5 w-5 transition",
                active ? "text-[#8E1B1B]" : "text-[#CBD5E1]"
              )}
              fill={active ? "currentColor" : "none"}
            />
          </button>
        );
      })}

      <div className="ml-2 hidden sm:block pr-2">
        <p className="text-xs font-semibold text-[#0F172A] tabular-nums">
          {value ? `${value}/5` : "Select"}
        </p>
        <p className="text-[11px] text-[#64748B]">
          Click again to clear
        </p>
      </div>
    </div>
  );
}

export default function ReviewSection({ productId, embedded = false }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}/reviews`);
      if (res.data.success) setReviews(res.data.reviews || []);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <section className={embedded ? "" : "mt-12"}>
      {!embedded ? (
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="ds-eyebrow">Social proof</p>
            <h2 className="ds-title mt-2">Customer reviews</h2>
            <p className="ds-body mt-2">Real feedback on taste, freshness, and packaging.</p>
          </div>
        </div>
      ) : null}

      <div className={cn(embedded ? "mt-4" : "mt-6", "grid gap-6 lg:grid-cols-5")}>
        {/* Review form */}
        <Card className="p-6 lg:col-span-2" hover={false}>
          <p className="text-sm font-semibold text-[#0F172A]">Write a review</p>
          <p className="mt-1 text-sm text-[#64748B]">
            {reviews.length === 0 ? "Be the first to review this product." : "Help others choose confidently."}
          </p>

          <div className="mt-5">
            <p className="text-xs font-semibold text-[#64748B]">Rating</p>
            <div className="mt-2">
              <StarPicker value={rating} onChange={setRating} disabled={submitting} />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[#64748B]">Your review</p>
              <p className="text-[11px] text-[#94A3B8] tabular-nums">
                {Math.min(500, comment.length)}/500
              </p>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Share what you liked—taste, freshness, packaging, delivery…"
              rows={5}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#F8FAFC] p-3 text-sm leading-relaxed
                         outline-none transition focus:border-[#8E1B1B] focus:ring-4 focus:ring-[rgba(142,27,27,0.12)]"
            />
            <p className="mt-2 text-[11px] text-[#64748B]">
              Tip: You can click the selected star again to remove it.
            </p>
          </div>

          <Button
            onClick={submitReview}
            disabled={submitting || !rating || !comment.trim()}
            className="mt-5 h-12 w-full"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </Card>

        {/* Review list */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5 animate-pulse" hover={false}>
                  <div className="h-4 w-32 rounded bg-[#E2E8F0]" />
                  <div className="mt-3 h-3 w-full rounded bg-[#E2E8F0]" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-[#E2E8F0]" />
                </Card>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <Card className="p-8" hover={false}>
              <p className="text-sm font-semibold text-[#0F172A]">No reviews yet</p>
              <p className="mt-2 text-sm text-[#64748B]">
                Be the first to review and help others decide.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <Card key={r._id} className="p-5" hover={false}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {r.userName || "Customer"}
                      </p>
                      {getLocation(r) ? (
                        <p className="mt-0.5 text-xs text-[#64748B] line-clamp-1">
                          {getLocation(r)}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold">
                      <Stars value={r.rating} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[#475569] leading-relaxed">{r.comment}</p>
                  <p className="mt-3 text-[11px] text-[#64748B]">
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

