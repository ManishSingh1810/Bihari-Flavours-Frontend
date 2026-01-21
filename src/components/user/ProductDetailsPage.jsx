import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import { Share2 } from "lucide-react";
import Button from "../ui/Button.jsx";
import QtyStepper from "./product/QtyStepper.jsx";
import ImageGallery from "./pdp/ImageGallery.jsx";
import PurchasePanel from "./pdp/PurchasePanel.jsx";
import InfoPanels from "./pdp/InfoPanels.jsx";
import ReviewSection from "./pdp/ReviewSection.jsx";
import RecommendedProducts from "./pdp/RecommendedProducts.jsx";

function formatRs(amount) {
  if (amount == null || amount === "") return "";
  return `Rs. ${amount}`;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { cartItemsByProductId, addToCart, setCartQuantity } = useUser();

  const [active, setActive] = useState(0);

  const logoutUser = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, listRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products`),
        ]);

        if (!pRes.data.success) throw new Error("Failed to load product");
        setProduct(pRes.data.product);

        if (listRes.data.success) setAllProducts(listRes.data.products || []);

        setActive(0);
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) return logoutUser();
        toast.error(e?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    const arr =
      Array.isArray(product.photos) && product.photos.length > 0
        ? product.photos
        : product.photo
        ? [product.photo]
        : [];
    return arr.length ? arr : ["https://placehold.co/900x900/EEE/AAA?text=No+Image"];
  }, [product]);

  const isOutOfStock = product?.quantity === "outofstock";

  // WhatsApp share
  const shareOnWhatsApp = () => {
    if (!product) return;
    const url = window.location.href;
    const text = `Check out ${product.name} on Bihari Flavours: ${url}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank");
  };

  // related products (exclude current)
  const related = useMemo(() => {
    const list = (allProducts || []).filter((p) => p._id !== id);

    // If you have category in DB, prefer same category:
    if (product?.category) {
      const sameCat = list.filter((p) => p.category === product.category);
      return (sameCat.length ? sameCat : list).slice(0, 4);
    }

    // else just show first 4 (already sorted by newest)
    return list.slice(0, 4);
  }, [allProducts, id, product]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (isOutOfStock) return toast.error("This product is currently out of stock");

    setUpdating(true);
    try {
      const res = await addToCart(product._id);
      if (!res?.success) throw new Error("Add to cart failed");
      showActionToast({
        title: "Added to cart",
        message: "Item added successfully.",
        actionLabel: "View cart",
        onAction: () => navigate("/cart"),
        duration: 3000,
      });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(e?.response?.data?.message || "Failed to add to cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleMinus = async () => {
    if (!product) return;
    const currentQty = cartItemsByProductId?.get(String(product._id)) || 0;
    const nextQty = Math.max(0, (Number(currentQty) || 0) - 1);
    setUpdating(true);
    try {
      const res = await setCartQuantity(product._id, nextQty);
      if (!res?.success) throw new Error("Failed to update cart");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) return logoutUser();
      toast.error(e?.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        Product not found
      </div>
    );
  }

  const netQuantity = product.netQuantity || product.weight || product.size || "";
  const shelfLife = product.shelfLife || "";
  const ingredients = product.ingredients || "";
  const storage = product.storage || "Store in a cool, dry place";

  const qty = cartItemsByProductId?.get(String(product._id)) || 0;

  const handleBuyNow = async () => {
    // Keep existing cart API; just navigate faster for conversion.
    await handleAddToCart();
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#64748B] hover:text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[rgba(142,27,27,0.18)] rounded-lg px-2 py-1"
          >
            ← Back
          </button>

          <Button variant="secondary" onClick={shareOnWhatsApp}>
            <Share2 size={16} /> Share
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: gallery */}
          <ImageGallery
            images={images}
            active={active}
            setActive={setActive}
            productName={product.name}
            aspect="square"
          />

          {/* Right: purchase panel */}
          <PurchasePanel
            product={product}
            qty={qty}
            updating={updating}
            isOutOfStock={isOutOfStock}
            netQuantity={netQuantity}
            onAdd={handleAddToCart}
            onMinus={handleMinus}
            onBuyNow={handleBuyNow}
          />
        </div>

        {/* Below fold */}
        <InfoPanels
          product={product}
          ingredients={ingredients}
          shelfLife={shelfLife}
          storage={storage}
        />

        <ReviewSection productId={product._id} />

        <RecommendedProducts
          title="You may also like"
          products={related}
          cartItemsByProductId={cartItemsByProductId}
          updating={updating}
          onAdd={(pid) => addToCart(pid)}
          onMinus={(pid, currentQty) => setCartQuantity(pid, Math.max(0, (Number(currentQty) || 0) - 1))}
          variant="grid"
        />
      </div>

      {/* Mobile sticky bar (conversion) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-black/5 p-3 lg:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-[#64748B]">Price</p>
            <p className="text-base font-semibold tabular-nums text-[#8E1B1B] truncate">
              {formatRs(product.price)}
            </p>
          </div>

          {qty > 0 ? (
            <QtyStepper
              qty={qty}
              outOfStock={isOutOfStock}
              disabled={updating}
              onMinus={handleMinus}
              onPlus={handleAddToCart}
              size="sm"
            />
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={updating || isOutOfStock}
              className="h-11 px-5"
            >
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
