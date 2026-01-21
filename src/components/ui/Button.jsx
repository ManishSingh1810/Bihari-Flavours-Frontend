import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

const VARIANTS = {
  primary: "ds-btn ds-btn-primary",
  secondary: "ds-btn ds-btn-secondary",
  ghost: "ds-btn ds-btn-ghost",
};

export default function Button({
  as: As = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  return <As className={cn(VARIANTS[variant] || VARIANTS.primary, className)} {...props} />;
}

