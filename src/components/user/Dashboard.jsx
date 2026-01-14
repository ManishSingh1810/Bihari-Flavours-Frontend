import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import api from "../../api/axios";
import hero from "../../assets/hero.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* ----------------------- Helpers ----------------------- */
const logoutUser = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

/* ---------------- Add To Cart Button ------------------- */
const AddToCartButton = ({ productId, onAdd, disabled }) => (
  <button
    onClick={() => onAdd(productId)}
    disabled={disabled}
    className="rounded-md border border-[#8E1B1B] px-4 py-2 text-sm
               text-[#8E1B1B] transition
               hover:bg-[rgba(142,27,27,0.05)]
               disabled:opacity-50"
  >
    {disabled ? "Adding…" : "Add to Cart"}
  </button>
);

/* ---------------- Product Card ------------------------- */
const ProductCard = ({ product, handleAddToCart, adding }) => {
  const navigate = useNavigate();

  const img =
    Array.isArray(product.photos) && product.photos.length > 0
      ? product.photos[0]
      : product.photo || "https://placehold.co/1200x800/EEE/AAA?text=No+Image";

  const openProductPage = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <article
      onClick={openProductPage}
      className="flex cursor-pointer flex-col rounded-lg
                 border border-[rgba(142,27,27,0.25)]
                 bg-[#F3EFE8] p-4 transition
                 hover:bg-[#FAF7F2]"
    >
      <div className="rounded-md bg-white border border-[rgba(142,27,27,0.12)] overflow-hidden">
        <img
          src={img}
          alt={product.name}
          className="h-40 w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="text-lg font-semibold text-[#1F1B16]">
          {product.name}
        </h3>

        <p className="mt-1 flex-grow text-sm text-[#6F675E] line-clamp-2">
          {product.desc}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-lg font-semibold text-[#8E1B1B]">
            ₹{product.price}
          </span>

          {/* Prevent navigation when clicking Add to Cart */}
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <AddToCartButton
              productId={product._id}
              onAdd={handleAddToCart}
              disabled={adding === product._id}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

const FloatingQuote = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-[#FAF7F2] px-6 py-20"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p
          className="font-[var(--font-heading)]
                     text-3xl sm:text-4xl
                     text-[#1F1B16]
                     leading-relaxed"
        >
          “Flavours aren’t rushed.
          <span className="block text-[#8E1B1B] mt-2">
            They are remembered.”
          </span>
        </p>

        <p className="mt-6 text-sm text-[#6F675E] italic">
          — Inspired by Bihar’s home kitchens
        </p>
      </div>
    </motion.section>
  );
};

const ScrollHighlights = () => {
  const items = [
    "Small-batch preparation",
    "Traditional recipes passed down generations",
    "No shortcuts. No dilution.",
  ];

  return (
    <section className="bg-[#FAF7F2] px-6 pb-20">
      <div className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-3 text-center">
        {items.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="rounded-xl border
                       border-[rgba(142,27,27,0.2)]
                       bg-white/60 p-6"
          >
            <p className="text-sm text-[#1F1B16]">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* ------------------------- HOME ------------------------ */
const Dashboard = () => {
  const { scrollYProgress } = useScroll();
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [error, setError] = useState("");

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
    setAdding(productId);
    try {
      const res = await api.post("/cart", { productId });
      if (!res.data.success) throw new Error("Failed to add to cart");
      toast.success("Added to cart");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setAdding(null);
    }
  };

  return (
    <>
      {/* HERO */}
      <motion.section
        className="relative bg-[#FAF7F2]
                   border-b border-[rgba(142,27,27,0.25)]"
      >
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
          <motion.div
            style={{ y: contentY }}
            className="grid items-center gap-14 lg:grid-cols-2"
          >
            {/* LEFT */}
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-6xl lg:text-7xl font-semibold text-[#1F1B16]">
                Bihari
                <span className="block text-[#8E1B1B]">Flavours</span>
              </h1>

              <p className="mb-6 max-w-xl text-lg text-[#6F675E] lg:text-xl">
                Food shaped by memory, patience, and the quiet confidence of
                home kitchens across Bihar.
              </p>

              <p className="mb-8 max-w-xl text-sm leading-relaxed text-[#6F675E]">
                Our products are prepared in small batches using methods that
                favour care over speed.
              </p>

              <Link
                to="/product"
                className="inline-flex items-center gap-2
                           rounded-md border border-[#8E1B1B]
                           px-6 py-3 text-[#8E1B1B]
                           hover:bg-[rgba(142,27,27,0.05)]"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="flex text-[#8E1B1B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[#6F675E] text-sm">
                    Trusted by 50+ families across India
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">
              <img
                src={hero}
                alt="Bihari Flavours"
                className="mx-auto
                           h-[15rem] w-[25rem]
                           sm:h-[20rem] sm:w-[35rem]
                           lg:h-[20rem] lg:w-[35rem]
                           rounded-2xl object-cover
                           border border-[rgba(142,27,27,0.25)]"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ALL PRODUCTS (Home Grid) */}
      <section
        className="bg-[#F3EFE8] py-16 px-6
                   border-t border-[rgba(142,27,27,0.25)]"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-semibold text-[#1F1B16]">
            All Products
          </h2>

          {loading && <p className="text-center">Loading…</p>}
          {error && <p className="text-center text-[#8E1B1B]">{error}</p>}

          {!loading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                  adding={adding}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ Quote & Highlights AFTER products */}
      <FloatingQuote />
      <ScrollHighlights />
    </>
  );
};

export default Dashboard;



