import React from "react";
import toast from "react-hot-toast";

export function showActionToast({
  title,
  message,
  actionLabel,
  onAction,
  duration = 4500,
}) {
  return toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl
                    transition-all ${t.visible ? "opacity-100" : "opacity-0"}`}
        style={{ zIndex: 250000 }}
      >
        <div className="flex items-start gap-3 p-4">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#8E1B1B]" />

          <div className="min-w-0 flex-1">
            {title && (
              <p className="text-sm font-semibold text-[#1F1B16]">{title}</p>
            )}
            {message && (
              <p className="mt-1 text-sm text-[#6F675E] leading-relaxed">
                {message}
              </p>
            )}

            {actionLabel && onAction && (
              <button
                type="button"
                onClick={() => {
                  try {
                    onAction();
                  } finally {
                    toast.dismiss(t.id);
                  }
                }}
                className="mt-3 inline-flex items-center rounded-lg bg-[#8E1B1B] px-3 py-2 text-xs font-semibold text-white"
              >
                {actionLabel}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="rounded-md px-2 py-1 text-sm text-[#6F675E] hover:bg-[#F8FAFC] hover:text-[#1F1B16]"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    ),
    { duration }
  );
}

