import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import hero1 from "../../assets/hero.jpg";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import HeroSwiper from "./home/HeroSwiper";
import ReviewsCarousel from "./home/ReviewsCarousel";
import ProductCard from "./product/ProductCard.jsx";
import { getDefaultVariantLabel } from "../../utils/variants.js";



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

        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-[#8E1B1B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-[#64748B]">Loading products…</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-8 text-center">
            <p className="text-sm text-[#8E1B1B] mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#1F1B16] shadow-sm hover:bg-[#F8FAFC]"
            >
              Try again
            </button>
          </div>
        )}

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
                because the process doesn't change: small batches, honest ingredients, and attention to detail.
              </p>
              <p>
                Whether you're ordering for your home, gifting to family, or stocking your pantry, we want the experience to feel premium — from taste to packaging.
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
                "Flavours aren't rushed. They are remembered."
              </p>
              <p className="mt-2 text-[#64748B] text-sm">Inspired by Bihar's home kitchens</p>
            </div>
          </div>
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
    let mounted = true;
    
    async function loadProducts() {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setError("");
        
        // retry once if backend is waking up / slow network
        let res;
        try {
          res = await api.get("/products");
        } catch (e) {
          if (!mounted) return;
          // one retry after short delay
          await new Promise((r) => setTimeout(r, 900));
          if (!mounted) return;
          res = await api.get("/products");
        }
        
        if (!mounted) return;
        
        if (!res?.data?.success) throw new Error("Failed to fetch products");
        setItems(res.data.products || []);
        setError("");
      } catch (err) {
        if (!mounted) return;
        
        const status = err?.response?.status;
        if (status === 401 || status === 403) return logoutUser();
        
        const message = err?.response?.data?.message || err?.message || "Failed to load products";
        setError(message);
      } finally {
        if (mounted) {
        setLoading(false);
        }
      }
    }
    
    loadProducts();
    
    return () => {
      mounted = false;
    };
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
      <ReviewsCarousel products={items} />
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






