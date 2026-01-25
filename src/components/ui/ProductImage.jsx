import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * Shared product image renderer:
 * - consistent aspect ratio (prevents layout shift)
 * - object-cover center crop
 * - rounded corners + subtle neutral background (good for transparent PNGs)
 */
export default function ProductImage({
  src,
  alt,
  aspect = "square", // "square" | "fourFive"
  loading = "lazy",
  className = "",
  imgClassName = "",
  roundedClass = "rounded-2xl",
  backgroundClass = "bg-[#F8FAFC]",
  showRing = true,
  draggable = false,
  imgProps = {},
  children,
  ...wrapperProps
}) {
  const aspectClass = aspect === "fourFive" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        roundedClass,
        backgroundClass,
        showRing && "ring-1 ring-black/5",
        className
      )}
      {...wrapperProps}
    >
      <div className={cn("w-full", aspectClass)}>
        <img
          src={src}
          alt={alt}
          loading={loading}
          draggable={draggable}
          className={cn("h-full w-full object-cover object-center", imgClassName)}
          {...imgProps}
        />
      </div>
      {children}
    </div>
  );
}

