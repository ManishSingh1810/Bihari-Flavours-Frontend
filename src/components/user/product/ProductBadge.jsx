import React from "react";

export default function ProductBadge({ children, tone = "muted" }) {
  const toneClass =
    tone === "danger"
      ? "bg-white text-gray-600 ring-gray-200"
      : tone === "brand"
        ? "bg-white text-[#8E1B1B] ring-[rgba(142,27,27,0.25)]"
        : "bg-white text-[#334155] ring-black/10";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
        "ring-1 shadow-sm",
        toneClass,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

