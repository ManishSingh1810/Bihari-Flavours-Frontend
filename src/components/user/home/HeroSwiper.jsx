import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const [slides, setSlides] = useState(null); // null until we decide what to render
  const [visible, setVisible] = useState(false); // fade-in once first image is loaded
  const inflight = useRef(0);

  const normalize = (arr) => {
    if (!Array.isArray(arr)) return null;
    return defaultSlides.map((s, i) => {
      const fromApi = arr[i] || {};
      const imageUrl = fromApi.imageUrl || fromApi.image || fromApi.url;
      return { ...s, image: imageUrl || s.image };
    });
  };

  const preloadFirst = async (nextSlides) => {
    const first = nextSlides?.[0]?.image;
    if (!first) return;
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = first;
    });
  };

  // Load hero images/titles from backend (admin uploads) with fallback to local assets.
  useEffect(() => {
    (async () => {
      // Step 1: try cached immediately (but still preload before showing)
      let cachedNormalized = null;
      try {
        const raw = localStorage.getItem("homepageHeroSlides:v1");
        const cached = raw ? JSON.parse(raw) : null;
        cachedNormalized = normalize(cached);
      } catch {
        cachedNormalized = null;
      }

      // If we have cached, render it (after preload) to avoid blank screen.
      if (cachedNormalized) {
        const token = ++inflight.current;
        setVisible(false);
        await preloadFirst(cachedNormalized);
        if (token !== inflight.current) return;
        setSlides(cachedNormalized);
        setVisible(true);
      }

      // Step 2: fetch latest from backend; swap only after first new image is loaded (no flash)
      try {
        const res = await api.get("/homepage", {
          params: { t: Date.now() },
          skipErrorToast: true,
        });
        const heroSlides =
          res?.data?.homepage?.heroSlides ||
          res?.data?.heroSlides ||
          res?.data?.homepage ||
          null;

        if (!Array.isArray(heroSlides) || heroSlides.length === 0) {
          if (!cachedNormalized) {
            // no backend + no cache → fallback to bundled images
            const token = ++inflight.current;
            setVisible(false);
            await preloadFirst(defaultSlides);
            if (token !== inflight.current) return;
            setSlides(defaultSlides);
            setVisible(true);
          }
          return;
        }

        // Cache for next reload
        try {
          localStorage.setItem(
            "homepageHeroSlides:v1",
            JSON.stringify(heroSlides.slice(0, 3))
          );
        } catch {
          // ignore
        }

        const latest = normalize(heroSlides);
        if (!latest) return;

        const currentUrls = (slides || cachedNormalized || []).map((s) => s.image).join("|");
        const nextUrls = latest.map((s) => s.image).join("|");
        if (currentUrls === nextUrls && slides) return;

        const token = ++inflight.current;
        setVisible(false);
        await preloadFirst(latest);
        if (token !== inflight.current) return;
        setSlides(latest);
        setVisible(true);
      } catch {
        if (!cachedNormalized) {
          const token = ++inflight.current;
          setVisible(false);
          await preloadFirst(defaultSlides);
          if (token !== inflight.current) return;
          setSlides(defaultSlides);
          setVisible(true);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSlides]);

  return (
    <section
      className="relative w-full overflow-hidden bg-white"
      aria-roledescription="carousel"
      aria-label="Homepage hero"
    >
      {/* Fixed heights to minimize CLS */}
      <div className="relative h-[220px] sm:h-[320px] lg:h-[380px] xl:h-[420px]">
        {slides ? (
          <div
            className={cn(
              "h-full transition-opacity duration-300",
              visible ? "opacity-100" : "opacity-0"
            )}
          >
            <Swiper
              key={slides.map((s) => s.image).join("|")}
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
                  <div className="relative h-full bg-[#F8FAFC]">
                    {/* Full-bleed hero image (reference style) */}
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
        ) : (
          <div className="h-full w-full bg-[#F8FAFC]" />
        )}
      </div>
    </section>
  );
}

