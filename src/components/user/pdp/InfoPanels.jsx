import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import Card from "../../ui/Card.jsx";
import ReviewSection from "./ReviewSection.jsx";
import Button from "../../ui/Button.jsx";
import { Link } from "react-router-dom";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function buildSections({ product, ingredients, shelfLife, storage }) {
  const about = String(product?.description || product?.desc || "").trim();
  const ing = String(ingredients || "").trim();
  const st = String(storage || "").trim();
  const sl = String(shelfLife || "").trim();

  return [
    {
      id: "about",
      label: "About",
      kind: "text",
      content: about || "—",
    },
    {
      id: "ingredients",
      label: "Ingredients",
      kind: "text",
      content: ing || "Ingredients details will be updated soon.",
    },
    {
      id: "storage",
      label: "Storage",
      kind: "text",
      content: st || "Store in a cool, dry place.",
    },
    {
      id: "shelfLife",
      label: "Shelf life",
      kind: "text",
      content: sl || "Shelf life details will be updated soon.",
    },
    {
      id: "reviews",
      label: "Reviews",
      kind: "reviews",
    },
    {
      id: "shippingReturns",
      label: "Shipping & Returns",
      kind: "shippingReturns",
    },
  ];
}

export default function InfoPanels({ product, ingredients, shelfLife, storage }) {
  const sections = useMemo(
    () => buildSections({ product, ingredients, shelfLife, storage }),
    [product, ingredients, shelfLife, storage]
  );

  const [tab, setTab] = useState(sections[0]?.id || "about");
  const [open, setOpen] = useState(() => new Set([sections[0]?.id || "about"]));

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
        <Card className="mt-6 p-6" hover={false}>
          <h2 className="text-lg font-semibold text-[#0F172A]">{current.label}</h2>
          <div className="mt-4">
            {current.kind === "reviews" ? (
              <ReviewSection productId={product?._id} embedded />
            ) : current.kind === "shippingReturns" ? (
              <ShippingReturns />
            ) : (
              <p className="text-sm leading-relaxed text-[#475569] whitespace-pre-line">
                {current.content}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Mobile accordions */}
      <div className="md:hidden space-y-3">
        {sections.map((s) => {
          const isOpen = open.has(s.id);
          return (
            <Card key={s.id} className="overflow-hidden" hover={false}>
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
                  {s.kind === "reviews" ? (
                    <ReviewSection productId={product?._id} embedded />
                  ) : s.kind === "shippingReturns" ? (
                    <ShippingReturns />
                  ) : (
                    <p className="text-sm leading-relaxed text-[#475569] whitespace-pre-line">
                      {s.content}
                    </p>
                  )}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ShippingReturns() {
  return (
    <div className="space-y-3 text-sm text-[#475569] leading-relaxed">
      <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-black/5">
        <p className="font-semibold text-[#0F172A]">Dispatch & delivery</p>
        <ul className="mt-2 space-y-1">
          <li>
            <span className="font-semibold text-[#0F172A]">Dispatch:</span> 24–48 hrs
          </li>
          <li>Shipping calculated at checkout.</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-[#F8FAFC] p-4 ring-1 ring-black/5">
        <p className="font-semibold text-[#0F172A]">Returns</p>
        <p className="mt-2">
          Please refer to our{" "}
          <Link to="/returns" className="font-semibold text-[#8E1B1B] hover:underline">
            Returns Policy
          </Link>{" "}
          for eligibility and timelines.
        </p>
        <div className="mt-3">
          <Button as={Link} to="/shipping" variant="secondary" className="h-10">
            View shipping details
          </Button>
        </div>
      </div>
    </div>
  );
}
