import React, { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import api from "../../../api/axios";
import hero1 from "../../../assets/hero.jpg";


function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function HeroImage({ src, alt, loading, fetchpriority }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable="false"
      loading={loading}
      fetchPriority={fetchpriority}
      className="hero-img"
    />
  );
}

export default function HeroSwiper() {
  const defaultSlides = useMemo(
    () => [
      {
        id: "s1",
        image: hero1,
      },
    ],
    []
  );

  const [slides, setSlides] = useState(null);
  const [visible, setVisible] = useState(false);
  const inflight = useRef(0);

  // ✅ bump cache key so old cached cropped data is ignored
  const CACHE_KEY = "homepageHeroSlides:v2";

  const normalize = (arr) => {
    if (!Array.isArray(arr)) return null;

    const slidesToUse = arr.length > 0 ? arr : defaultSlides;

    return slidesToUse.map((fromApi, i) => {
      const imageUrl = fromApi.imageUrl || fromApi.image || fromApi.url;

      // ✅ IMPORTANT: ignore mobile image completely for now
      // because mobile variant is likely already cropped/zoomed.
      return {
        id: fromApi.id || `slide-${i}`,
        image: imageUrl || defaultSlides[0]?.image,
      };
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

  useEffect(() => {
    (async () => {
      let cachedNormalized = null;

      try {
        const raw = localStorage.getItem(CACHE_KEY);
        const cached = raw ? JSON.parse(raw) : null;
        cachedNormalized = normalize(cached);
      } catch {
        cachedNormalized = null;
      }

      if (cachedNormalized) {
        const token = ++inflight.current;
        setVisible(false);
        await preloadFirst(cachedNormalized);
        if (token !== inflight.current) return;
        setSlides(cachedNormalized);
        setVisible(true);
      }

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
            const token = ++inflight.current;
            setVisible(false);
            await preloadFirst(defaultSlides);
            if (token !== inflight.current) return;
            setSlides(defaultSlides);
            setVisible(true);
          }
          return;
        }

        // ✅ cache latest
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(heroSlides.slice(0, 3)));
        } catch {}

        const latest = normalize(heroSlides);
        if (!latest) return;

        const currentUrls = (slides || cachedNormalized || [])
          .map((s) => s.image)
          .join("|");
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
    <section className="hero-wrap" aria-label="Homepage hero">
      <div className={cn("hero-fade", visible ? "opacity-100" : "opacity-0")}>
        {slides && slides.length > 0 ? (
          slides.length === 1 ? (
            <div className="hero-frame">
              <HeroImage
                src={slides[0].image}
                alt="Bihari Flavours"
                loading="eager"
                fetchpriority="high"
              />
            </div>
          ) : (
            <Swiper
              key={slides.map((s) => s.image).join("|")}
              modules={[Autoplay, Pagination, Navigation, A11y]}
              slidesPerView={1}
              loop={false}
              rewind
              speed={650}
              initialSlide={0}
              autoHeight={true}
              pagination={{ clickable: true }}
              navigation
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              a11y={{ enabled: true }}
              className="hero-swiper"
            >
              {slides.map((s, idx) => (
                <SwiperSlide key={s.id}>
                  <div className="hero-frame">
                    <HeroImage
                      src={s.image}
                      alt="Bihari Flavours"
                      loading={idx === 0 ? "eager" : "lazy"}
                      fetchpriority={idx === 0 ? "high" : "auto"}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )
        ) : (
          <div className="hero-skeleton" />
        )}
      </div>
    </section>
  );
}
