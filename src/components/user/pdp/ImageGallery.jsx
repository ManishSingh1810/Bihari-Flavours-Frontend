import React, { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Card from "../../ui/Card.jsx";
import Button from "../../ui/Button.jsx";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function ImageGallery({
  images,
  active,
  setActive,
  productName = "Product",
  aspect = "square", // "square" | "fourFive"
}) {
  const touchStartX = useRef(null);

  const safeImages = useMemo(() => {
    if (Array.isArray(images) && images.length) return images;
    return ["https://placehold.co/900x900/EEE/AAA?text=No+Image"];
  }, [images]);

  const count = safeImages.length;
  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);

  // Swipe (mobile)
  const onTouchStart = (e) => (touchStartX.current = e.touches?.[0]?.clientX ?? null);
  const onTouchEnd = (e) => {
    const startX = touchStartX.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX == null || endX == null) return;
    const dx = endX - startX;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const aspectClass = aspect === "fourFive" ? "aspect-[4/5]" : "aspect-square";

  return (
    <Card className="p-4" hover={false}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-[#F8FAFC] ring-1 ring-black/5",
          "group"
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className={cn("w-full", aspectClass)}>
          <img
            src={safeImages[active]}
            alt={`${productName} image ${active + 1}`}
            className={cn(
              "h-full w-full object-cover",
              "transition-transform duration-300",
              "lg:group-hover:scale-[1.06]"
            )}
            loading="eager"
            draggable="false"
          />
        </div>

        {/* Zoom affordance (desktop) */}
        <div className="hidden lg:flex absolute left-3 top-3 items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#0F172A] ring-1 ring-black/10">
          <Search className="h-4 w-4 text-[#8E1B1B]" />
          Hover to zoom
        </div>

        {count > 1 ? (
          <>
            <Button
              variant="ghost"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        ) : null}
      </div>

      {/* Thumbnails */}
      {count > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "shrink-0 overflow-hidden rounded-xl bg-white ring-1",
                idx === active ? "ring-[rgba(142,27,27,0.45)]" : "ring-black/5 hover:ring-black/10"
              )}
              style={{ width: 76, height: 76 }}
              aria-label={`Select image ${idx + 1}`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                draggable="false"
              />
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

