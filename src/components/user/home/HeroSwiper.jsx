import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { ArrowRight, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../../api/axios";
import hero1 from "../../../assets/hero.jpg";
import hero2 from "../../../assets/hero.png";
import hero3 from "../../../assets/code.jpg";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

function PrimaryButton({ as: As = "button", className = "", ...props }) {
  return (
    <As
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[#8E1B1B] px-5 py-3 text-sm font-semibold text-white shadow-sm",
        "hover:bg-[#741616] focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]",
        className
      )}
      {...props}
    />
  );
}

function SecondaryButton({ as: As = "button", className = "", ...props }) {
  return (
    <As
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur",
        "hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/15",
        className
      )}
      {...props}
    />
  );
}

export default function HeroSwiper() {
  const navigate = useNavigate();

  const defaultSlides = useMemo(
    () => [
      {
        id: "s1",
        image: hero1,
        eyebrow: "Premium Homemade Snacks",
        title: "Taste Bihar, delivered fresh.",
        subtitle:
          "Small-batch flavours crafted with care — perfect for gifting, daily cravings, and festivals.",
        cta: { label: "Shop Products", to: "/product" },
        secondary: { label: "Explore Products", to: "/product" },
      },
      {
        id: "s2",
        image: hero2,
        eyebrow: "Authentic • Hygienic • Fast",
        title: "Crunchy classics. Honest ingredients.",
        subtitle:
          "From sattu to snacks — pantry staples made the traditional way.",
        cta: { label: "Shop Products", to: "/product" },
        secondary: { label: "View Cart", to: "/cart" },
      },
      {
        id: "s3",
        image: hero3,
        eyebrow: "Gift-ready packs",
        title: "Gift packs for every occasion.",
        subtitle:
          "Perfect for festivals & family — curated picks with premium packaging.",
        cta: { label: "Explore Products", to: "/product" },
        secondary: { label: "Browse All", to: "/product" },
      },
    ],
    []
  );

  const [slides, setSlides] = useState(defaultSlides);

  // Load hero images/titles from backend (admin uploads) with fallback to local assets.
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/homepage", { skipErrorToast: true });
        const heroSlides =
          res?.data?.homepage?.heroSlides ||
          res?.data?.heroSlides ||
          res?.data?.homepage ||
          null;

        if (!Array.isArray(heroSlides) || heroSlides.length === 0) return;

        setSlides((prev) =>
          prev.map((s, i) => {
            const fromApi = heroSlides[i] || {};
            const imageUrl = fromApi.imageUrl || fromApi.image || fromApi.url;
            return {
              ...s,
              image: imageUrl || s.image,
              eyebrow: fromApi.eyebrow || s.eyebrow,
              title: fromApi.title || s.title,
              subtitle: fromApi.subtitle || s.subtitle,
              cta: fromApi.cta || s.cta,
              secondary: fromApi.secondary || s.secondary,
            };
          })
        );
      } catch {
        // ignore; fallback to bundled images
      }
    })();
  }, [defaultSlides]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0B1220]"
      aria-roledescription="carousel"
      aria-label="Homepage hero"
    >
      {/* Fixed heights to minimize CLS */}
      <div className="relative h-[520px] sm:h-[640px] lg:h-[720px]">
        <Swiper
          modules={[Autoplay, Pagination, A11y]}
          slidesPerView={1}
          loop
          speed={650}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          a11y={{ enabled: true }}
          className="h-full hero-swiper"
        >
          {slides.map((s, idx) => (
            <SwiperSlide key={s.id}>
              <div className="relative h-full">
                <img
                  src={s.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                  draggable="false"
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchpriority={idx === 0 ? "high" : "auto"}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />

                <div className={cn(container, "relative h-full")}>
                  <div className="flex h-full items-center">
                    <div className="max-w-2xl pb-10 sm:pb-16">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                        {s.eyebrow}
                      </p>

                      <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl text-white">
                        {s.title}
                      </h1>

                      <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed">
                        {s.subtitle}
                      </p>

                      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <PrimaryButton as={Link} to={s.cta.to}>
                          {s.cta.label} <ArrowRight className="h-4 w-4" />
                        </PrimaryButton>
                        <SecondaryButton as={Link} to={s.secondary.to}>
                          {s.secondary.label}
                        </SecondaryButton>
                      </div>

                      <div className="mt-10 flex items-center gap-3">
                        <div
                          className="flex items-center gap-1 text-[#FDE68A]"
                          aria-label="Rating 5 out of 5"
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-white/70">
                          Loved by families across India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Quick actions (premium chips) */}
      {/* Removed negative margin to prevent overlap/unorganized look */}
      <div className={cn(container, "pt-6 pb-10 relative")}>
        <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/product?q=thekua")}
            className="rounded-2xl bg-white/10 px-4 py-3 text-left text-white hover:bg-white/15"
          >
            <p className="text-sm font-semibold">Thekua</p>
            <p className="mt-1 text-xs text-white/70">Traditional sweet crunch</p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/product?q=sattu")}
            className="rounded-2xl bg-white/10 px-4 py-3 text-left text-white hover:bg-white/15"
          >
            <p className="text-sm font-semibold">Chana Sattu</p>
            <p className="mt-1 text-xs text-white/70">Classic + Jaljeera flavour</p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/product?q=makhana")}
            className="rounded-2xl bg-white/10 px-4 py-3 text-left text-white hover:bg-white/15"
          >
            <p className="text-sm font-semibold">Makhana</p>
            <p className="mt-1 text-xs text-white/70">Light & premium snack</p>
          </button>
        </div>
      </div>
    </section>
  );
}

