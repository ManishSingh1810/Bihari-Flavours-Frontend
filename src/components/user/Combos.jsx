import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ProductCard from "./product/ProductCard.jsx";
import { useUser } from "../../Context/userContext";
import { showActionToast } from "../ui/showActionToast.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getDefaultVariantLabel, getVariantByLabel } from "../../utils/variants.js";

export default function CombosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        const list = res?.data?.products || [];
        if (mounted) setItems(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const combos = useMemo(() => {
    const list = (items || []).filter((p) => String(p?.productType || "") === "combo");
    return list.sort((a, b) => Number(a?.displayOrder ?? 9999) - Number(b?.displayOrder ?? 9999));
  }, [items]);

  const handleAdd = async (productId, variantLabel = "") => {
    const product = items.find((p) => String(p?._id) === String(productId));
    const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
    const vLabel = hasVariants ? String(variantLabel || getDefaultVariantLabel(product) || "") : "";
    if (hasVariants) {
      const v = getVariantByLabel(product.variants, vLabel) || product.variants[0];
      if (Number(v?.stock ?? 0) === 0) {
        toast.error("This variant is currently out of stock");
        return;
      }
    } else if (product?.inStock === false || product?.quantity === "outofstock") {
      toast.error("This product is currently out of stock");
      return;
    }
    setUpdating(`${String(productId)}::${String(vLabel || "")}`);
    try {
      const res = await addToCart(productId, vLabel);
      if (!res?.success) throw new Error("Add to cart failed");
      showActionToast({
        title: "Added to cart",
        message: "Item added successfully.",
        actionLabel: "View cart",
        onAction: () => navigate("/cart"),
        duration: 3000,
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to add to cart");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="ds-eyebrow">Combos</p>
          <h1 className="ds-title mt-2">Combos & Packs</h1>
          <p className="ds-body mt-2 max-w-2xl">
            Curated packs built for gifting and everyday snacking — premium value, same trusted taste.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="ds-card p-3 sm:p-4 animate-pulse">
                  <div className="rounded-2xl bg-[#F1F5F9] ring-1 ring-black/5">
                    <div className="aspect-[4/5] w-full" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-[#E2E8F0]" />
                    <div className="h-3 w-32 rounded bg-[#E2E8F0]" />
                    <div className="h-3 w-full rounded bg-[#E2E8F0]" />
                  </div>
                </div>
              ))
            : combos.map((p) => {
                const vLabel = getDefaultVariantLabel(p);
                const key = `${String(p?._id)}::${String(vLabel || "")}`;
                return (
                  <ProductCard
                    key={p._id}
                    product={p}
                    disabled={updating === key}
                    onAdd={handleAdd}
                  />
                );
              })}
        </div>

        {!loading && combos.length === 0 ? (
          <div className="mt-10 ds-card p-8">
            <p className="text-sm font-semibold text-[#0F172A]">No combos yet</p>
            <p className="mt-2 text-sm text-[#64748B]">
              Create combo products in Admin and set <span className="font-semibold">productType</span> to{" "}
              <span className="font-semibold">combo</span>.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

