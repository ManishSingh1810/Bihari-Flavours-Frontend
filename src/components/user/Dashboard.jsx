import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  Sparkles,
  Gift,
  Star,
  Plus,
  Minus,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import hero1 from "../../assets/hero.jpg";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import HeroSwiper from "./home/HeroSwiper";

/* ----------------------- Helpers ----------------------- */
const logoutUser = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* --------------------- UI Pieces ---------------------- */
function PrimaryButton({ as: As = "button", className = "", ...props }) {
  return (
    <As
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[#8E1B1B] px-5 py-3 text-sm font-semibold text-white shadow-sm",
        "hover:bg-[#741616] focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)]",
        className
      )}
      {...props}
    />
  );
}

function SecondaryButton({ as: As = "button", className = "", ...props }) {
  return (
    <As
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1F1B16] shadow-sm",
        "hover:bg-[#F8FAFC] focus:outline-none focus:ring-4 focus:ring-black/5",
        className
      )}
      {...props}
    />
  );
}

function SectionHeading({ eyebrow, title, subtitle, align = "left" }) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center")}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8E1B1B]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl sm:text-4xl text-[#0F172A]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base text-[#475569]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CategoryCards() {
  const navigate = useNavigate();
  const categories = [
    { title: "Thekua", desc: "Festival-style sweet crunch.", icon: <Sparkles className="h-5 w-5" />, q: "thekua" },
    { title: "Chana Sattu", desc: "Classic + Jaljeera flavour.", icon: <Leaf className="h-5 w-5" />, q: "sattu" },
    { title: "Mixture & Nimki", desc: "Chiwda + nimki for chai time.", icon: <BadgeCheck className="h-5 w-5" />, q: "chiwda" },
    { title: "Banana Chips & Makhana", desc: "Premium crunchy snacks.", icon: <Gift className="h-5 w-5" />, q: "makhana" },
  ];

  return (
    <section className="bg-[#F8FAFC]">
      <div className={cn(container, "py-14 sm:py-16")}>
        <SectionHeading
          eyebrow="Shop by category"
          title="Find your next favourite"
          subtitle="Browse quick categories to explore what you love — from snacks to gift-ready combos."
          align="center"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => navigate(`/product?q=${encodeURIComponent(c.q)}`)}
              className="group rounded-3xl border border-black/5 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#0F172A]">{c.title}</p>
                  <p className="mt-1 text-sm text-[#64748B]">{c.desc}</p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#8E1B1B] border border-black/5 group-hover:bg-white">
                  {c.icon}
                </span>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#8E1B1B]">
                Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function QtyPill({ qty, onMinus, onPlus, disabled }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <button
        type="button"
        onClick={onMinus}
        disabled={disabled}
        className="inline-flex h-10 w-10 items-center justify-center hover:bg-[#F8FAFC] disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[40px] text-center text-sm font-semibold text-[#0F172A]">
        {qty}
      </span>
      <button
        type="button"
        onClick={onPlus}
        disabled={disabled}
        className="inline-flex h-10 w-10 items-center justify-center hover:bg-[#F8FAFC] disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProductTile({ product, qty, updating, onAdd, onMinus }) {
  const navigate = useNavigate();
  const img =
    product?.photos?.[0] ||
    product?.photo ||
    "https://placehold.co/900x900/EEE/AAA?text=No+Image";

  return (
    <article
      className="group rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => navigate(`/product/${product._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product._id}`)}
      aria-label={`View ${product.name}`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#F8FAFC]">
        <div className="aspect-square w-full">
          <img src={img} alt={product.name} className="h-full w-full object-contain p-4" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-[#0F172A] line-clamp-1">{product.name}</p>
        <p className="mt-1 text-xs text-[#64748B] line-clamp-2">{product.desc}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-base font-semibold text-[#8E1B1B]">₹{product.price}</p>

          <div onClick={(e) => e.stopPropagation()}>
            {qty > 0 ? (
              <QtyPill
                qty={qty}
                disabled={updating === product._id}
                onMinus={onMinus}
                onPlus={onAdd}
              />
            ) : (
              <button
                type="button"
                onClick={onAdd}
                disabled={updating === product._id}
                className="inline-flex items-center gap-2 rounded-xl bg-[#8E1B1B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#741616] disabled:opacity-50"
              >
                Add <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductsShowcase({
  products,
  loading,
  error,
  cartItemsByProductId,
  updating,
  onAdd,
  onMinus,
}) {
  const list = useMemo(() => products || [], [products]);

  return (
    <section className="bg-white border-y border-black/5">
      <div className={cn(container, "py-14 sm:py-16")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Shop"
            title="All products"
            subtitle="Explore our premium snacks & staples."
          />
        </div>

        {loading && <p className="text-sm text-[#64748B]">Loading…</p>}
        {error && <p className="text-sm text-[#8E1B1B]">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((p) => {
                const qty = cartItemsByProductId?.get(String(p._id)) || 0;
                return (
                  <ProductTile
                    key={p._id}
                    product={p}
                    qty={qty}
                    updating={updating}
                    onAdd={() => onAdd(p._id)}
                    onMinus={() => onMinus(p._id, qty)}
                  />
                );
              })}
            </div>

            <div className="mt-10">
              <SecondaryButton as={Link} to="/product" className="w-full sm:w-auto">
                View all products <ArrowRight className="h-4 w-4" />
              </SecondaryButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CombosSection() {
  const navigate = useNavigate();
  const combos = [
    {
      title: "Starter Combo",
      desc: "A balanced mix for first-time buyers.",
      points: ["Best for gifting", "Great value", "Customer favourites"],
      tag: "Popular",
      q: "combo starter",
    },
    {
      title: "Snack Lover Pack",
      desc: "Crunchy assortment for daily cravings.",
      points: ["Perfect with chai", "Family-size", "Fresh batch"],
      tag: "New",
      q: "combo snack",
    },
    {
      title: "Protein Pantry",
      desc: "Staples focused on energy & nutrition.",
      points: ["Sattu-first", "Traditional prep", "High satiety"],
      tag: "Value",
      q: "sattu combo",
    },
  ];

  return (
    <section className="bg-[#F8FAFC]">
      <div className={cn(container, "py-14 sm:py-16")}>
        <SectionHeading
          eyebrow="Combos"
          title="Curated packs, premium value"
          subtitle="Try combo packs built for taste, gifting, and everyday pantry essentials."
          align="center"
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {combos.map((c) => (
            <div
              key={c.title}
              className="relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="absolute right-4 top-4 rounded-full bg-[#F8FAFC] px-3 py-1 text-[11px] font-semibold text-[#8E1B1B] border border-black/5">
                {c.tag}
              </div>

              <p className="text-lg font-semibold text-[#0F172A]">{c.title}</p>
              <p className="mt-2 text-sm text-[#64748B]">{c.desc}</p>

              <ul className="mt-5 space-y-2 text-sm text-[#334155]">
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F8FAFC] border border-black/5 text-[#8E1B1B]">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between gap-3">
                <SecondaryButton
                  type="button"
                  onClick={() => navigate(`/product?q=${encodeURIComponent(c.q)}`)}
                >
                  Explore
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  onClick={() => navigate(`/product?q=${encodeURIComponent(c.q)}`)}
                >
                  Shop combo <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="bg-white border-y border-black/5">
      <div className={cn(container, "py-14 sm:py-16")}>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="Food that feels like home."
              subtitle="We preserve recipes shaped by seasons, festivals, and everyday hunger — prepared patiently, packed hygienically, delivered with care."
            />

            <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
              <p>
                At Bihari Flavours, we build for consistency — that first bite that tastes the same every time,
                because the process doesn’t change: small batches, honest ingredients, and attention to detail.
              </p>
              <p>
                Whether you’re ordering for your home, gifting to family, or stocking your pantry, we want the experience to feel premium — from taste to packaging.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton as={Link} to="/product">
                Shop now <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <SecondaryButton as={Link} to="/privacy-policy">
                Learn more
              </SecondaryButton>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-[#0B1220] shadow-sm">
            <img src={hero1} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white text-lg">“Flavours aren’t rushed. They are remembered.”</p>
              <p className="mt-2 text-white/70 text-sm">Inspired by Bihar’s home kitchens</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const reviews = [
    { name: "Aditi", city: "Bengaluru", text: "Packaging was premium and the taste felt truly homemade. Reordered within a week.", rating: 5 },
    { name: "Rohit", city: "Delhi", text: "Fast delivery and the flavours are spot on. Great for gifting too.", rating: 5 },
    { name: "Neha", city: "Mumbai", text: "Loved the consistency and freshness. The combo packs are great value.", rating: 5 },
  ];

  return (
    <section className="bg-[#F8FAFC]">
      <div className={cn(container, "py-14 sm:py-16")}>
        <SectionHeading
          eyebrow="Reviews"
          title="Loved by customers"
          subtitle="Real words from people who reorder for taste, freshness, and trust."
          align="center"
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{r.name}</p>
                  <p className="text-xs text-[#64748B]">{r.city}</p>
                </div>
                <div className="flex items-center gap-1 text-[#F59E0B]" aria-label={`Rating ${r.rating} out of 5`}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm text-[#475569] leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQAccordion() {
  const faqs = [
    { q: "Do you deliver across India?", a: "Yes, we ship pan-India with hygienic packing and careful handling." },
    { q: "How do you ensure freshness?", a: "We prepare in small batches and pack in sealed, quality-checked packaging." },
    { q: "Do you support COD and Online payment?", a: "Yes, COD and Online are supported depending on your location/pincode." },
    { q: "How can I track my order?", a: "After placing an order, you can view status updates in the Orders section." },
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="bg-white border-y border-black/5">
      <div className={cn(container, "py-14 sm:py-16")}>
        <SectionHeading
          eyebrow="FAQ"
          title="Quick answers"
          subtitle="Everything you need to know about ordering, delivery, and quality."
        />

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const open = i === openIdx;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;

            return (
              <div key={f.q} className="rounded-2xl border border-black/5 bg-[#F8FAFC] overflow-hidden">
                <button
                  id={buttonId}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(open ? -1 : i)}
                >
                  <span className="text-sm font-semibold text-[#0F172A]">{f.q}</span>
                  <ChevronDown className={cn("h-5 w-5 text-[#64748B] transition", open && "rotate-180")} />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn("px-5 pb-5 text-sm text-[#475569] leading-relaxed", !open && "hidden")}
                >
                  {f.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- HOME ------------------------ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const { cartItemsByProductId, addToCart, setCartQuantity } = useUser();

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await api.get("/products");
        if (!res.data.success) throw new Error("Failed to fetch products");
        setItems(res.data.products || []);
        setError("");
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) return logoutUser();
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    setUpdating(productId);
    try {
      const res = await addToCart(productId);
      if (!res?.success) throw new Error("Failed to add to cart");
      showActionToast({
        title: "Added to cart",
        message: "Item added successfully.",
        actionLabel: "View cart",
        onAction: () => navigate("/cart"),
        duration: 3000,
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleMinus = async (productId, currentQty) => {
    const nextQty = Math.max(0, (Number(currentQty) || 0) - 1);
    setUpdating(productId);
    try {
      const res = await setCartQuantity(productId, nextQty);
      if (!res?.success) throw new Error("Failed to update cart");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <main className="bg-[#F8FAFC]">
      <HeroSwiper />

      {/* All products showcase before categories (standard + premium) */}
      <ProductsShowcase
        products={items}
        loading={loading}
        error={error}
        cartItemsByProductId={cartItemsByProductId}
        updating={updating}
        onAdd={handleAddToCart}
        onMinus={handleMinus}
      />
      <CategoryCards />
      <CombosSection />
      <BrandStory />
      <ReviewsSection />
      <FAQAccordion />

      {/* Premium CTA strip (footer-like) */}
      <section className="bg-white border-t border-black/5">
        <div className={cn(container, "py-12")}>
          <div className="grid gap-6 rounded-3xl border border-black/5 bg-[#F8FAFC] p-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8E1B1B]">
                Premium experience
              </p>
              <h3 className="mt-2 text-2xl text-[#0F172A]">Ready to order?</h3>
              <p className="mt-2 text-sm text-[#64748B]">
                Explore snacks and staples — prepared in small batches and delivered with care.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <SecondaryButton as={Link} to="/cart">
                View cart
              </SecondaryButton>
              <PrimaryButton as={Link} to="/product">
                Shop now <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}




