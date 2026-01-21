import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function Input({ className = "", ...props }) {
  return <input className={cn("ds-input", className)} {...props} />;
}

