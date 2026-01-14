import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const logoutUser = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`); // ✅ needs backend route
        if (!res.data.success) throw new Error("Failed to load product");
        setProduct(res.data.product);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) return logoutUser();
        toast.error(e?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.quantity === "outofstock") {
      toast.error("This product is currently out of stock");
      return;
    }

    setAdding(true);
    try {
      const res = await api.post("/cart", { productId: product._id });
      if (!res.data.success) throw new Error("Add to cart failed");
      toast.success("Added to cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) return logoutUser();
      toast.error(e?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        Product not found
      </div>
    );
  }

  const images =
    Array.isArray(product.photos) && product.photos.length > 0
      ? product.photos
      : [product.photo || "https://placehold.co/800x600/EEE/AAA?text=No+Image"];

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-[#6F675E]"
        >
          ← Back
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-[rgba(142,27,27,0.25)] bg-[#F3EFE8] p-4">
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg"
            />
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.slice(0, 8).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className="h-16 w-full object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[rgba(142,27,27,0.25)] bg-[#F3EFE8] p-6">
            <h1 className="text-3xl font-semibold text-[#1F1B16]">
              {product.name}
            </h1>

            <p className="mt-3 text-[#6F675E]">{product.desc}</p>

            <div className="mt-6 flex items-center justify-between border-t pt-6">
              <div className="text-2xl font-semibold text-[#8E1B1B]">
                ₹{product.price}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || product.quantity === "outofstock"}
                className="rounded-md border border-[#8E1B1B] px-5 py-2 text-sm text-[#8E1B1B] hover:bg-[#8E1B1B] hover:text-white disabled:opacity-50"
              >
                {product.quantity === "outofstock"
                  ? "Out of Stock"
                  : adding
                  ? "Adding…"
                  : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
