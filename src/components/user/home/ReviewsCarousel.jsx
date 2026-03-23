import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, A11y } from "swiper/modules";
import { Star } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import api from "../../../api/axios";

// Cache all reviews on homepage to avoid refetching repeatedly
const HOME_ALL_REVIEWS_TTL_MS = 5 * 60 * 1000; // 5 minutes
let HOME_ALL_REVIEWS_CACHE = { ts: 0, reviews: [] };

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="flex items-center gap-1 text-[#F59E0B]" aria-label={`Rating ${v} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star 
          key={i} 
          className={cn(
            "h-4 w-4",
            i < v ? "fill-current" : "fill-none stroke-[#CBD5E1]"
          )} 
        />
      ))}
    </div>
  );
}

function getLocation(r) {
  // Try multiple possible field names for location
  const raw =
    r?.location ||      // ✅ Backend uses this field (but it's empty!)
    r?.city ||
    r?.userCity ||
    r?.userLocation ||
    r?.address?.city ||
    r?.user?.city ||
    r?.user?.location ||
    r?.user?.address?.city ||
    "";
  return String(raw || "").trim();
}

function getUserName(r) {
  // Try multiple possible field names for user name
  const raw =
    r?.customerName ||  // ✅ Backend uses this field
    r?.userName ||
    r?.name ||
    r?.user?.name ||
    r?.user?.userName ||
    r?.userId?.name ||
    "";
  return String(raw || "Customer").trim() || "Customer";
}

function ReviewCard({ review, skeleton = false }) {
  if (skeleton) {
    return (
      <div className="h-full rounded-3xl border border-black/5 bg-white p-6 shadow-sm animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-[#E2E8F0] rounded" />
            <div className="h-3 w-24 bg-[#E2E8F0] rounded" />
          </div>
          <div className="h-4 w-20 bg-[#E2E8F0] rounded" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full bg-[#E2E8F0] rounded" />
          <div className="h-3 w-11/12 bg-[#E2E8F0] rounded" />
          <div className="h-3 w-5/6 bg-[#E2E8F0] rounded" />
        </div>
      </div>
    );
  }

  const location = getLocation(review);
  const text = String(review?.comment || "").trim();
  const name = getUserName(review);
  const rating = review?.rating || 5;

  // Debug log to see what data we're getting
  console.log('Review data:', { 
    name, 
    location, 
    rawReview: review,
    allFields: Object.keys(review || {})
  });

  return (
    <div className="h-full rounded-3xl border border-black/5 bg-white p-6 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0F172A] truncate">{name}</p>
          {location ? (
            <p className="text-xs text-[#64748B] line-clamp-1 mt-1">{location}</p>
          ) : null}
        </div>
        <Stars value={rating} />
      </div>
      
      <p className="text-sm text-[#475569] leading-relaxed flex-1 line-clamp-4">
        {text}
      </p>
    </div>
  );
}

export default function ReviewsCarousel({ products }) {
  const [reviews, setReviews] = useState(() => {
    // Use cache if fresh
    if (Date.now() - HOME_ALL_REVIEWS_CACHE.ts < HOME_ALL_REVIEWS_TTL_MS) {
      return HOME_ALL_REVIEWS_CACHE.reviews || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(true); // Start as true to show loading state
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    let mounted = true;

    // If we have fresh cache, use it and don't fetch
    if (Date.now() - HOME_ALL_REVIEWS_CACHE.ts < HOME_ALL_REVIEWS_TTL_MS && reviews.length > 0) {
      setLoading(false);
      setHasFetched(true);
      return () => {
        mounted = false;
      };
    }

    // Fetch ALL reviews from all products
    (async () => {
      if (!products || products.length === 0) {
        if (mounted) {
          setLoading(false);
          setHasFetched(true);
        }
        return;
      }

      try {
        setLoading(true);

        // Fetch reviews for all products in parallel
        const results = await Promise.allSettled(
          products.map(async (p) => {
            try {
              const res = await api.get(`/products/${p._id}/reviews`, { 
                skipErrorToast: true 
              });
              const productReviews = res?.data?.reviews || [];
              return productReviews.map(rv => ({
                ...rv,
                productId: p._id,
                productName: p.name || "Product"
              }));
            } catch {
              return [];
            }
          })
        );

        // Flatten all reviews
        const allReviews = [];
        for (const r of results) {
          if (r.status === "fulfilled" && Array.isArray(r.value)) {
            allReviews.push(...r.value);
          }
        }

        // Filter: only include reviews with meaningful content
        const filtered = allReviews.filter((rv) => {
          const comment = String(rv?.comment || "").trim();
          return comment.length >= 10; // At least 10 characters
        });

        // Sort by date (newest first), then by rating (highest first)
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;
          return (b.rating || 0) - (a.rating || 0);
        });

        // Cache and update
        HOME_ALL_REVIEWS_CACHE = { ts: Date.now(), reviews: filtered };
        if (mounted) {
          setReviews(filtered);
          setHasFetched(true);
        }
      } catch {
        if (mounted) {
          setReviews([]);
          setHasFetched(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [products, reviews.length]);

  // Only hide section after we've fetched and confirmed there are no reviews
  if (hasFetched && !loading && (!reviews || reviews.length === 0)) return null;

  const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

  return (
    <section className="bg-[#F8FAFC] border-y border-black/5">
      <div className={cn(container, "py-14 sm:py-16")}>
        {/* Section Heading */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8E1B1B]">
            Reviews
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl text-[#0F172A]">
            Loved by customers
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#475569]">
            Real words from people who reorder for taste, freshness, and trust.
          </p>
        </div>

        {/* Carousel or Loading State */}
        {loading ? (
          // Loading skeleton - show 3 cards on desktop, 1 on mobile
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewCard key={`skeleton-${i}`} skeleton />
            ))}
          </div>
        ) : reviews.length === 0 ? null : (
          <div className="reviews-carousel-container">
            <Swiper
              modules={[Autoplay, Pagination, Navigation, A11y]}
              spaceBetween={16}
              slidesPerView={1}
              loop={reviews.length > 1} // Enable loop if more than 1 review
              speed={600}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: true,
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              navigation={reviews.length > 1} // Show arrows if more than 1 review
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 16,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
              }}
              className="reviews-swiper"
            >
              {reviews.map((review, idx) => (
                <SwiperSlide key={review._id || `review-${idx}`}>
                  <ReviewCard review={review} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
