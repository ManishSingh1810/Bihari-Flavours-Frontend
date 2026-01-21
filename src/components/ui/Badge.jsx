import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

const TONES = {
  brand: "ds-badge ds-badge-brand",
  muted: "ds-badge ds-badge-muted",
  danger: "ds-badge ds-badge-danger",
};

export default function Badge({ tone = "muted", className = "", ...props }) {
  return <span className={cn(TONES[tone] || TONES.muted, className)} {...props} />;
}

