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

/**
 * ResponsiveHeroImage - Automatically serves mobile/desktop images
 * Uses <picture> element for native browser optimization
 * 
 * @param {string} src - Desktop image URL
 * @param {string} srcMobile - Mobile-optimized image URL (optional)
 * @param {string} alt - Alt text
 * @param {string} loading - 'eager' or 'lazy'
 * @param {string} fetchpriority - 'high' or 'auto'
 */
function ResponsiveHeroImage({ src, srcMobile, alt, loading, fetchpriority, className }) {
  // If no mobile version provided, use desktop for both
  if (!srcMobile) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        draggable="false"
        loading={loading}
        fetchPriority={fetchpriority}
      />
    );
  }

  // Use <picture> element for responsive images (best practice)
  return (
    <picture>
      {/* Mobile: Load optimized version for screens ≤ 768px */}
      <source media="(max-width: 768px)" srcSet={srcMobile} />
      
      {/* Desktop: Load full resolution */}
      <img
        src={src}
        alt={alt}
        className={className}
        draggable="false"
        loading={loading}
        fetchPriority={fetchpriority}
      />
    </picture>
  );
}


/**
 * HeroSwiper Component
 * 
 * Displays homepage hero images with smart rendering:
 * - 0 slides: Shows loading fallback (gray background)
 * - 1 slide: Static image (no Swiper overhead, faster load)
 * - 2+ slides: Full Swiper carousel with autoplay, pagination, navigation
 * 
 * Features:
 * - Fetches slides from backend admin panel
 * - Falls back to local assets if backend unavailable
 * - Caches slides in localStorage for instant subsequent loads
 * - Preloads first image before display to prevent flash
 * - Optimized for mobile with responsive heights
 * - Supports mobile-optimized images (imageUrlMobile) for faster mobile loads
 * 
 * Backend Response Format:
 * {
 *   "heroSlides": [
 *     {
 *       "imageUrl": "https://...desktop.jpg",
 *       "imageUrlMobile": "https://...mobile-768x1024.jpg",  // Optional
 *       "title": "Hero title",
 *       "subtitle": "Subtitle",
 *       "link": "https://..."
 *     }
 *   ]
 * }
 */
export default function HeroSwiper() {
  // Use only 1 default slide to avoid carousel when no backend images
  const defaultSlides = useMemo(
    () => [
      {
        id: "s1",
        image: hero1,
      },
    ],
    []
  );

  const [slides, setSlides] = useState(null); // null until we decide what to render
  const [visible, setVisible] = useState(false); // fade-in once first image is loaded
  const inflight = useRef(0);

  const normalize = (arr) => {
    if (!Array.isArray(arr)) return null;
    
    // If backend returns multiple slides, use them all
    // If backend returns 1 slide, use just that one
    // This allows flexibility: admin can upload 1 or multiple images
    const slidesToUse = arr.length > 0 ? arr : defaultSlides;
    
    return slidesToUse.map((fromApi, i) => {
      const imageUrl = fromApi.imageUrl || fromApi.image || fromApi.url;
      const imageUrlMobile = fromApi.imageUrlMobile || fromApi.imageMobile || null;
      return { 
        id: fromApi.id || `slide-${i}`,
        image: imageUrl || defaultSlides[0]?.image,
        imageMobile: imageUrlMobile, // Mobile-optimized version (optional)
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
      <div className="relative h-[280px] sm:h-[380px] md:h-[440px] lg:h-[500px] xl:h-[560px]">
        {slides && slides.length > 0 ? (
          <div
            className={cn(
              "h-full transition-opacity duration-300",
              visible ? "opacity-100" : "opacity-0"
            )}
          >
            {/* SINGLE SLIDE: Show as static image (no Swiper overhead) */}
            {slides.length === 1 ? (
              <div className="relative h-full bg-[#F8FAFC]">
                <ResponsiveHeroImage
                  src={slides[0].image}
                  srcMobile={slides[0].imageMobile}
                  alt="Bihari Flavours"
                  className="h-full w-full object-cover object-center"
                  loading="eager"
                  fetchpriority="high"
                />
              </div>
            ) : (
              /* MULTIPLE SLIDES: Use Swiper carousel */
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
                      {/* Full hero image - fills container for prominent display */}
                      <ResponsiveHeroImage
                        src={s.image}
                        srcMobile={s.imageMobile}
                        alt="Bihari Flavours"
                        className="h-full w-full object-cover object-center"
                        loading={idx === 0 ? "eager" : "lazy"}
                        fetchpriority={idx === 0 ? "high" : "auto"}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        ) : (
          /* NO SLIDES: Show fallback loading state */
          <div className="h-full w-full bg-[#F8FAFC]" />
        )}
      </div>
    </section>
  );
}

