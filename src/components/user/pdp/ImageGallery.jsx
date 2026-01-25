import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Card from "../../ui/Card.jsx";
import Button from "../../ui/Button.jsx";
import ProductImage from "../../ui/ProductImage.jsx";

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
  const [open, setOpen] = useState(false);

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
      if (open && e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, open]);

  // Lock scroll when fullscreen is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <Card className="p-4" hover={false}>
      <ProductImage
        src={safeImages[active]}
        alt={`${productName} image ${active + 1}`}
        aspect={aspect === "fourFive" ? "fourFive" : "square"}
        loading="eager"
        className="group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="Open image fullscreen"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        draggable="false"
      >

        {/* Fullscreen affordance */}
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-[#0F172A] ring-1 ring-black/10 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          aria-label="Open fullscreen"
        >
          <Maximize2 className="h-4 w-4 text-[#8E1B1B]" />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>

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
      </ProductImage>

      {/* Thumbnails */}
      {count > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "shrink-0 overflow-hidden rounded-xl ring-2",
                "focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]",
                idx === active ? "ring-[rgba(142,27,27,0.45)]" : "ring-black/5 hover:ring-black/10"
              )}
              aria-label={`Select image ${idx + 1}`}
            >
              <ProductImage
                src={img}
                alt=""
                aspect="square"
                loading="lazy"
                showRing={false}
                roundedClass="rounded-none"
                className="w-[76px]"
                draggable="false"
              />
            </button>
          ))}
        </div>
      ) : null}

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[99999]">
              <div
                className="absolute inset-0 bg-white/95 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              <div className="absolute inset-0 flex items-center justify-center p-0">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Product image fullscreen"
                  className="relative h-screen w-screen max-w-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="fixed right-4 z-[100000] inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-black/10 hover:bg-white"
                    style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
                    onClick={() => setOpen(false)}
                    aria-label="Close fullscreen"
                  >
                    <X className="h-5 w-5" /> Close
                  </button>

                  <div className="relative h-full w-full bg-white">
                    {/* Fill the screen without cropping the main image:
                        - Background: same image, cover + soft blur
                        - Foreground: contain (no zoom/crop) */}
                    <img
                      src={safeImages[active]}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-35"
                      draggable="false"
                    />
                    <div
                      className="relative z-10 h-full w-full"
                      onTouchStart={onTouchStart}
                      onTouchEnd={onTouchEnd}
                    >
                      <img
                        src={safeImages[active]}
                        alt={`${productName} image ${active + 1}`}
                        className="h-full w-full object-contain"
                        draggable="false"
                      />
                    </div>

                    {count > 1 ? (
                      <>
                        <button
                          type="button"
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 ring-1 ring-black/10 hover:bg-white"
                          onClick={prev}
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 ring-1 ring-black/10 hover:bg-white"
                          onClick={next}
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    ) : null}
                  </div>

                  {count > 1 ? (
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/85 backdrop-blur px-4 py-3 ring-1 ring-black/5">
                      <div className="flex gap-3 overflow-x-auto">
                      {safeImages.map((img, idx) => (
                        <button
                          key={`fs-${img}-${idx}`}
                          type="button"
                          onClick={() => setActive(idx)}
                          className={cn(
                              "shrink-0 overflow-hidden rounded-xl bg-white ring-1",
                              idx === active ? "ring-[rgba(142,27,27,0.45)]" : "ring-black/10 hover:ring-black/20"
                          )}
                          style={{ width: 76, height: 76 }}
                          aria-label={`Select image ${idx + 1}`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" draggable="false" />
                        </button>
                      ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </Card>
  );
}

