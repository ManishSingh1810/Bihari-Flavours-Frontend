import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


/* ---------------- Add To Cart Button ---------------- */
const AddToCartButton = ({ productId, onAdd, disabled, outOfStock }) => (
  <button
    onClick={() => !outOfStock && onAdd(productId)}
    disabled={disabled || outOfStock}
    className={`rounded-md border border-[#8E1B1B]
                px-4 py-2 text-sm transition
                ${
                  outOfStock
                    ? "cursor-not-allowed opacity-50 text-gray-400"
                    : "text-[#8E1B1B] hover:bg-[rgba(142,27,27,0.05)]"
                }`}
  >
    {outOfStock ? "Out of Stock" : disabled ? "Adding…" : "Add to Cart"}
  </button>
);

/* ---------------- Product Details Modal ---------------- */
const ProductDetailsModal = ({ product, onClose, onAdd, adding }) => {
  if (!product) return null;

  const [qty, setQty] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isOutOfStock = product.quantity === "outofstock";

  const images =
    Array.isArray(product.photos) && product.photos.length > 0
      ? product.photos
      : [
          product.photo ||
            "https://placehold.co/600x400/EEE/AAA?text=No+Image",
        ];

  useEffect(() => {
    setQty(0);
    setActiveImageIndex(0);
  }, [product._id]);

  const handleAdd = async () => {
    if (isOutOfStock) return;
    await onAdd(product._id);
    setQty(1);
  };

  const handleIncrease = async () => {
    if (isOutOfStock) return;
    await onAdd(product._id);
    setQty((q) => q + 1);
  };

  const handleDecrease = () => {
    setQty((q) => Math.max(0, q - 1));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        key={`modal-${product._id}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-xl rounded-2xl
                   bg-[#FAF7F2]
                   border border-[rgba(142,27,27,0.25)]
                   shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6F675E]
                     hover:text-[#1F1B16]"
        >
          ✕
        </button>

        <img
          src={images[activeImageIndex]}
          alt={product.name}
          className="h-64 w-full rounded-t-2xl object-cover"
        />

        {images.length > 1 && (
          <div className="flex gap-3 px-4 pt-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`h-14 w-14 overflow-hidden rounded-md border
                  ${
                    idx === activeImageIndex
                      ? "border-[#8E1B1B]"
                      : "border-transparent hover:border-[rgba(142,27,27,0.3)]"
                  }`}
              >
                <img src={img} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-5">
          <h2 className="text-2xl font-semibold text-[#1F1B16]">
            {product.name}
          </h2>

          <p className="text-sm text-[#6F675E]">{product.desc}</p>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-xl font-semibold text-[#8E1B1B]">
              ₹{product.price}
            </span>

            {isOutOfStock ? (
              <span className="rounded-md border px-5 py-2 text-sm text-gray-400 cursor-not-allowed">
                Out of Stock
              </span>
            ) : qty === 0 ? (
              <button
                onClick={handleAdd}
                disabled={adding === product._id}
                className="rounded-md border border-[#8E1B1B]
                           px-5 py-2 text-sm
                           text-[#8E1B1B]
                           hover:bg-[#8E1B1B]
                           hover:text-white"
              >
                {adding === product._id ? "Adding…" : "Add to Cart"}
              </button>
            ) : (
              <div className="flex items-center gap-3 border px-3 py-1">
                <button onClick={handleDecrease}>
                  <Minus size={16} />
                </button>
                <span>{qty}</span>
                <button onClick={handleIncrease}>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------- Products Page ---------------- */
export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();


  const logoutUser = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await api.get("/products");
        if (!res.data.success) throw new Error("Failed to fetch products");
        setItems(res.data.products);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) return logoutUser();
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    const product = items.find((p) => p._id === productId);

    if (product?.quantity === "outofstock") {
      toast.error("This product is currently out of stock");
      return;
    }

    setAdding(productId);
    try {
      const res = await api.post("/cart", { productId });
      if (!res.data.success) throw new Error("Add to cart failed");
      toast.success("Added to cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(
        e?.response?.data?.message || e.message || "Failed to add to cart"
      );
    } finally {
      setAdding(null);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        Loading…
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <p className="text-[#8E1B1B]">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-6 py-24">
      <AnimatePresence mode="wait">
        {selectedProduct && (
          <ProductDetailsModal
            key={`modal-${selectedProduct._id}`}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdd={handleAddToCart}
            adding={adding}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl">
        <h1 className="mb-12 text-center text-3xl font-semibold text-[#1F1B16]">
          Our Products
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => {
            const img =
              product.photos?.[0] ||
              product.photo ||
              "https://placehold.co/600x400/EEE/AAA?text=No+Image";

            return (
              <article
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}

     
                className="cursor-pointer rounded-lg border
                           border-[rgba(142,27,27,0.25)]
                           bg-[#F3EFE8] p-4 hover:bg-[#FAF7F2]"
              >
                <img
                  src={img}
                  alt={product.name}
                  className="h-40 w-full rounded-md object-cover"
                />

                <h3 className="mt-3 text-lg font-semibold text-[#1F1B16]">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-[#6F675E] line-clamp-2">
                  {product.desc}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-[#8E1B1B]">
                    ₹{product.price}
                  </span>

                  <div onClick={(e) => e.stopPropagation()}>
                    <AddToCartButton
                      productId={product._id}
                      onAdd={handleAddToCart}
                      disabled={adding === product._id}
                      outOfStock={product.quantity === "outofstock"}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}


