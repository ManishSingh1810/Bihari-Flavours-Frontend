import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "../../ui/Button.jsx";
import FilterBar from "./FilterBar.jsx";

export default function MobileFilterSheet({ open, onClose, ...filterProps }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <p className="ds-eyebrow">Filters</p>
            <p className="text-sm text-[#64748B]">Refine your results</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-10 w-10 rounded-full p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-5 overflow-y-auto h-[calc(100%-68px)]">
          <FilterBar mode="sheet" {...filterProps} onOpenMobile={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}

