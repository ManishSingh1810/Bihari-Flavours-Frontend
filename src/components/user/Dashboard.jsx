import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Star,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import hero1 from "../../assets/hero.jpg";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import HeroSwiper from "./home/HeroSwiper";
import ProductCard from "./product/ProductCard.jsx";
import { getDefaultVariantLabel } from "../../utils/variants.js";

// Cache real reviews on homepage to avoid refetching repeatedly
const HOME_REVIEWS_TTL_MS = 10 * 60 * 1000; // 10 minutes
let HOME_REVIEWS_CACHE = { ts: 0, cards: [] };

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
    <section className="bg-[#F8FAFC]">
      <div className={cn(container, "py-14 sm:py-16")}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8E1B1B]">
            Shop
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl text-[#0F172A]">
            All products
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Explore our premium snacks & staples.
          </p>
        </div>

        {loading && <p className="text-sm text-[#64748B]">Loading…</p>}
        {error && <p className="text-sm text-[#8E1B1B]">{error}</p>}

        {!loading && !error && (
          <>
            <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => {
                const vLabel = getDefaultVariantLabel(p);
                const key = `${String(p?._id)}::${String(vLabel || "")}`;
                return (
                  <ProductCard
                    key={p._id}
                    product={p}
                    disabled={updating === key}
                    onAdd={onAdd}
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


function BrandStory({ storyImageUrl }) {
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

          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
            {/* Fixed aspect so it stays consistent on all screens (no crop / no zoom). */}
            <div className="relative aspect-[4/3] bg-[#F8FAFC]">
              <img
                src={storyImageUrl || hero1}
                alt="Our story"
                className="absolute inset-0 h-full w-full object-contain"
                loading="lazy"
                draggable="false"
              />
            </div>
            <div className="border-t border-black/5 p-6">
              <p className="text-[#0F172A] text-base sm:text-lg">
                “Flavours aren’t rushed. They are remembered.”
              </p>
              <p className="mt-2 text-[#64748B] text-sm">Inspired by Bihar’s home kitchens</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ products }) {
  const [cards, setCards] = useState(() => {
    if (Date.now() - HOME_REVIEWS_CACHE.ts < HOME_REVIEWS_TTL_MS) {
      return HOME_REVIEWS_CACHE.cards || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  const candidates = useMemo(() => (products || []).slice(0, 10), [products]);

  const getLocation = (rv) => {
    const raw =
      rv?.city ||
      rv?.location ||
      rv?.userCity ||
      rv?.userLocation ||
      rv?.address?.city ||
      rv?.user?.city ||
      rv?.user?.location ||
      "";
    return String(raw || "").trim();
  };

  useEffect(() => {
    let mounted = true;

    // If we have fresh cache, use it.
    if (Date.now() - HOME_REVIEWS_CACHE.ts < HOME_REVIEWS_TTL_MS) {
      setCards(HOME_REVIEWS_CACHE.cards || []);
      return () => {
        mounted = false;
      };
    }

    // Fetch real 5-star reviews across a small set of products.
    (async () => {
      if (!candidates.length) return;
      try {
        setLoading(true);
        const results = await Promise.allSettled(
          candidates.map(async (p) => {
            const res = await api.get(`/products/${p._id}/reviews`, { skipErrorToast: true });
            const reviews = res?.data?.reviews || [];
            return { product: p, reviews };
          })
        );

        const all = [];
        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          const { product, reviews } = r.value || {};
          for (const rv of reviews || []) {
            if (Number(rv?.rating) !== 5) continue;
            const comment = String(rv?.comment || "").trim();
            if (comment.length < 12) continue;
            all.push({
              id: rv?._id || `${product?._id}-${rv?.createdAt || comment.slice(0, 10)}`,
              name: rv?.userName || "Customer",
              location: getLocation(rv),
              text: comment,
              rating: 5,
              createdAt: rv?.createdAt || null,
            });
          }
        }

        all.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (tb !== ta) return tb - ta;
          return (b.text?.length || 0) - (a.text?.length || 0);
        });

        const top = all.slice(0, 3);
        HOME_REVIEWS_CACHE = { ts: Date.now(), cards: top };
        if (mounted) setCards(top);
      } catch {
        if (mounted) setCards([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [candidates]);

  // If no real reviews yet, hide this section (no fake testimonials).
  if (!loading && (!cards || cards.length === 0)) return null;

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
          {(loading ? Array.from({ length: 3 }).map((_, i) => ({ id: `s-${i}`, skeleton: true })) : cards).map((r) =>
            r.skeleton ? (
              <div key={r.id} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-[#E2E8F0] rounded" />
                    <div className="h-3 w-20 bg-[#E2E8F0] rounded" />
                  </div>
                  <div className="h-4 w-20 bg-[#E2E8F0] rounded" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full bg-[#E2E8F0] rounded" />
                  <div className="h-3 w-5/6 bg-[#E2E8F0] rounded" />
                </div>
              </div>
            ) : (
              <div key={r.id} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{r.name}</p>
                    {r.location ? (
                      <p className="text-xs text-[#64748B] line-clamp-1">{r.location}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 text-[#F59E0B]" aria-label={`Rating ${r.rating} out of 5`}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm text-[#475569] leading-relaxed">{r.text}</p>
              </div>
            )
          )}
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
  const [storyImageUrl, setStoryImageUrl] = useState(null);
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

  // Load "Our story" image from backend homepage config (admin upload), with fallback to local asset.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = localStorage.getItem("homepageStoryImageUrl:v1");
        if (cached && mounted) setStoryImageUrl(cached);
      } catch {
        // ignore
      }

      try {
        const res = await api.get("/homepage", { params: { t: Date.now() }, skipErrorToast: true });
        const url =
          res?.data?.homepage?.storyImageUrl ||
          res?.data?.storyImageUrl ||
          res?.data?.homepage?.storyImage ||
          res?.data?.storyImage ||
          null;
        if (url && mounted) {
          setStoryImageUrl(url);
          try {
            localStorage.setItem("homepageStoryImageUrl:v1", url);
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore; fallback to local image
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = async (productId, variantLabel = "") => {
    const key = `${String(productId)}::${String(variantLabel || "")}`;
    setUpdating(key);
    try {
      const res = await addToCart(productId, variantLabel);
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
      <ReviewsSection products={items} />
      <BrandStory storyImageUrl={storyImageUrl} />
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




