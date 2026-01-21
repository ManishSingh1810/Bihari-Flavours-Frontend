import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function Card({ className = "", hover = false, ...props }) {
  return (
    <div className={cn("ds-card", hover && "ds-card-hover", className)} {...props} />
  );
}

