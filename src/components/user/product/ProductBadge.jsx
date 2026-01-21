import React from "react";
import Badge from "../../ui/Badge.jsx";

export default function ProductBadge({ children, tone = "muted" }) {
  return <Badge tone={tone}>{children}</Badge>;
}

