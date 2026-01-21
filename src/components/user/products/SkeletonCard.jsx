import React from "react";
import Card from "../../ui/Card.jsx";

export default function SkeletonCard() {
  return (
    <Card hover className="p-3 sm:p-4 animate-pulse">
      <div className="rounded-2xl bg-[#F1F5F9] ring-1 ring-black/5">
        <div className="aspect-square w-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-[#E2E8F0]" />
        <div className="h-3 w-full rounded bg-[#E2E8F0]" />
        <div className="h-3 w-5/6 rounded bg-[#E2E8F0]" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="h-5 w-20 rounded bg-[#E2E8F0]" />
        <div className="h-9 w-24 rounded-xl bg-[#E2E8F0]" />
      </div>
    </Card>
  );
}

