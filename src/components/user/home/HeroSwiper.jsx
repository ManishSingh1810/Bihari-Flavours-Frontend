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

/**
 * Forces NO cropping on any screen:
 * - Uses block + w-full + h-auto
 * - Uses objectFit: "contain" inline to beat any CSS override
 * - Wraps <picture> in a block element so height behaves correctly
 */
function ResponsiveHeroImage({
  src,
  srcMobile,
  alt,
  loading,
  fetchpriority,
  className,
}) {
  const imgEl = (
    <img
      src={src}
      alt={alt}
      draggable="false"
      loading={loading}
      fetchPriority={fetchpriority}
      className="block w-full"
      // Inline style beats many global/swiper css overrides (even if they set object-fit elsewhere)
      style={{
        width: "100%",
        height: "auto",
        minHeight: 0,
        maxHeight: "none",
        objectFit: "contain",
        objectPosition: "center",
        display: "block",
      }}
    />
  );

  if (!srcMobile) return imgEl;

  return (
    <picture 
      className="block w-full"
      style={{
        width: "100%",
        height: "auto",
        minHeight: 0,
        maxHeight: "none",
        display: "block",
      }}
    >
      <source media="(max-width: 768px)" srcSet={srcMobile} />
      {imgEl}
    </picture>
  );
}

export default function HeroSwiper() {
  const defaultSlides = useMemo(
    () => [
      {
        id: "s1",
        image: hero1,
        imageMobile: null,
      },
    ],
    []
  );

  const [slides, setSlides] = useState(null);
  const [visible, setVisible] = useState(false);
  const inflight = useRef(0);

  const normalize = (arr) => {
    if (!Array.isArray(arr)) return null;
    const slidesToUse = arr.length > 0 ? arr : defaultSlides;

    return slidesToUse.map((fromApi, i) => {
      const imageUrl = fromApi.imageUrl || fromApi.image || fromApi.url;
      const imageUrlMobile = fromApi.imageUrlMobile || fromApi.imageMobile || null;
      return {
        id: fromApi.id || `slide-${i}`,
        image: imageUrl || defaultSlides[0]?.image,
        imageMobile: imageUrlMobile,
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
        const raw = localStorage.getItem("homepageHeroSlides:v1");
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

        try {
          localStorage.setItem(
            "homepageHeroSlides:v1",
            JSON.stringify(heroSlides.slice(0, 3))
          );
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
    <section
      className="relative w-full bg-white"
      aria-roledescription="carousel"
      aria-label="Homepage hero"
      style={{
        height: "auto",
        minHeight: 0,
        maxHeight: "none",
      }}
    >
      <div
        className={cn(
          "w-full transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: "auto",
          minHeight: 0,
          maxHeight: "none",
        }}
      >
        {slides && slides.length > 0 ? (
          slides.length === 1 ? (
            // SINGLE IMAGE - no cropping ever (natural image height)
            <ResponsiveHeroImage
              src={slides[0].image}
              srcMobile={slides[0].imageMobile}
              alt="Bihari Flavours"
              loading="eager"
              fetchpriority="high"
            />
          ) : (
            // MULTI SLIDES - autoHeight makes Swiper adapt to image height (no forced crop)
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
              className="w-full hero-swiper"
            >
              {slides.map((s, idx) => (
                <SwiperSlide key={s.id}>
                  <ResponsiveHeroImage
                    src={s.image}
                    srcMobile={s.imageMobile}
                    alt="Bihari Flavours"
                    loading={idx === 0 ? "eager" : "lazy"}
                    fetchpriority={idx === 0 ? "high" : "auto"}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )
        ) : (
          <div className="w-full h-[220px] sm:h-[280px] md:h-[360px] bg-[#F8FAFC]" />
        )}
      </div>
    </section>
  );
}

