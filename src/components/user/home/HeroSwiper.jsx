import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import api from "../../../api/axios";
import hero1 from "../../../assets/hero.jpg";
import hero2 from "../../../assets/hero.png";
import hero3 from "../../../assets/code.jpg";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function HeroSwiper() {
  const defaultSlides = useMemo(
    () => [
      {
        id: "s1",
        image: hero1,
      },
      {
        id: "s2",
        image: hero2,
      },
      {
        id: "s3",
        image: hero3,
      },
    ],
    []
  );

  const [slides, setSlides] = useState(() => {
    // Avoid "flash of different image" on reload:
    // Use last known homepage hero image URLs from localStorage immediately.
    try {
      const raw = localStorage.getItem("homepageHeroSlides:v1");
      const cached = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(cached) || cached.length === 0) return defaultSlides;

      return defaultSlides.map((s, i) => {
        const c = cached[i] || {};
        const url = c.imageUrl || c.image || c.url;
        return { ...s, image: url || s.image };
      });
    } catch {
      return defaultSlides;
    }
  });

  // Load hero images/titles from backend (admin uploads) with fallback to local assets.
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/homepage", {
          // cache-bust so updated images show immediately after admin save
          // (avoid custom headers to prevent CORS preflight failures)
          params: { t: Date.now() },
          skipErrorToast: true,
        });
        const heroSlides =
          res?.data?.homepage?.heroSlides ||
          res?.data?.heroSlides ||
          res?.data?.homepage ||
          null;

        if (!Array.isArray(heroSlides) || heroSlides.length === 0) return;

        // Cache for next reload to avoid flicker
        try {
          localStorage.setItem(
            "homepageHeroSlides:v1",
            JSON.stringify(heroSlides.slice(0, 3))
          );
        } catch {
          // ignore
        }

        setSlides((prev) =>
          prev.map((s, i) => {
            const fromApi = heroSlides[i] || {};
            const imageUrl = fromApi.imageUrl || fromApi.image || fromApi.url;
            return {
              ...s,
              image: imageUrl || s.image,
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
      className="relative w-full overflow-hidden bg-white"
      aria-roledescription="carousel"
      aria-label="Homepage hero"
    >
      {/* Fixed heights to minimize CLS */}
      <div className="relative h-[240px] sm:h-[360px] lg:h-[460px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, A11y]}
          slidesPerView={1}
          // Avoid "flash" on load caused by loop cloning + initial translate snap.
          // Rewind keeps UX (auto/manual) without loop DOM duplication.
          loop={false}
          rewind
          speed={650}
          initialSlide={0}
          pagination={{ clickable: true }}
          navigation
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
                  alt="Bihari Flavours"
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable="false"
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchpriority={idx === 0 ? "high" : "auto"}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

