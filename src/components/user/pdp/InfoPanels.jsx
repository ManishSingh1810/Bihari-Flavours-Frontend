import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function buildSections({ product, ingredients, shelfLife, storage }) {
  const desc = String(product?.desc || "").trim();
  return [
    {
      id: "description",
      label: "Description",
      content: desc || "—",
    },
    {
      id: "ingredients",
      label: "Ingredients",
      content: ingredients ? ingredients : "Ingredients details will be updated soon.",
    },
    {
      id: "shelf",
      label: "Shelf life & storage",
      content: `${shelfLife ? `Shelf life: ${shelfLife}. ` : ""}${storage || ""}`.trim() ||
        "Store in a cool, dry place.",
    },
    {
      id: "nutrition",
      label: "Nutrition",
      content: "Nutrition information will be added soon.",
    },
    {
      id: "shipping",
      label: "Shipping & returns",
      content:
        "Dispatch in 24–48 hrs. Shipping is calculated at checkout. For any support, reach us on WhatsApp.",
    },
  ];
}

export default function InfoPanels({ product, ingredients, shelfLife, storage }) {
  const sections = useMemo(
    () => buildSections({ product, ingredients, shelfLife, storage }),
    [product, ingredients, shelfLife, storage]
  );

  const [tab, setTab] = useState(sections[0]?.id || "description");
  const [open, setOpen] = useState(() => new Set([sections[0]?.id || "description"]));

  const current = sections.find((s) => s.id === tab) || sections[0];

  return (
    <section className="mt-10">
      {/* Desktop tabs */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2 border-b border-black/5">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={cn(
                "px-4 py-3 text-sm font-semibold rounded-t-xl",
                "focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]",
                tab === s.id
                  ? "text-[#0F172A] border-b-2 border-[#8E1B1B]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5">
          <h2 className="text-lg font-semibold text-[#0F172A]">{current.label}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#475569] whitespace-pre-line">
            {current.content}
          </p>
        </div>
      </div>

      {/* Mobile accordions */}
      <div className="md:hidden space-y-3">
        {sections.map((s) => {
          const isOpen = open.has(s.id);
          return (
            <div key={s.id} className="rounded-3xl bg-white ring-1 ring-black/5">
              <button
                type="button"
                className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left"
                onClick={() => {
                  setOpen((prev) => {
                    const next = new Set(prev);
                    if (next.has(s.id)) next.delete(s.id);
                    else next.add(s.id);
                    return next;
                  });
                }}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-[#0F172A]">{s.label}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-[#64748B] transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen ? (
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed text-[#475569] whitespace-pre-line">
                    {s.content}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

