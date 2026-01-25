import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GripVertical, Save, RefreshCw } from "lucide-react";
import api from "../../api/axios";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

async function saveOrderBatch(orders) {
  // Try a few common endpoints for compatibility (backend may differ).
  const endpoints = [
    { method: "put", url: "/admin/products/reorder" },
    { method: "patch", url: "/admin/products/reorder" },
    { method: "put", url: "/products/reorder" },
    { method: "patch", url: "/products/reorder" },
  ];
  let lastErr = null;
  for (const ep of endpoints) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await api[ep.method](ep.url, { orders }, { skipErrorToast: true });
      if (res?.data?.success) return res.data;
      // if backend doesn't use success flag, treat 2xx as success
      return res?.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Failed to save order");
}

export default function ReorderProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState(null);

  const sorted = useMemo(() => {
    return [...(items || [])].sort((a, b) => Number(a?.displayOrder ?? 9999) - Number(b?.displayOrder ?? 9999));
  }, [items]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        if (mounted) setItems(res?.data?.products || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const move = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setItems((prev) => {
      const list = [...(prev || [])].sort(
        (a, b) => Number(a?.displayOrder ?? 9999) - Number(b?.displayOrder ?? 9999)
      );
      const fromIdx = list.findIndex((p) => String(p?._id) === String(fromId));
      const toIdx = list.findIndex((p) => String(p?._id) === String(toId));
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      // Recompute displayOrder as 1..n
      return list.map((p, i) => ({ ...p, displayOrder: i + 1 }));
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      const list = [...sorted];
      const orders = list.map((p, idx) => ({ productId: p._id, displayOrder: idx + 1 }));
      await saveOrderBatch(orders);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-6 py-14 pt-24">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#6F675E] hover:text-[#8E1B1B] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="rounded-xl border border-[rgba(142,27,27,0.15)] bg-[#F3EFE8] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#1F1B16]">Reorder Products</h2>
              <p className="mt-1 text-sm text-[#6F675E]">
                Drag and drop to set display order (1 = top). Then click Save.
              </p>
            </div>
            <button
              onClick={save}
              disabled={saving || loading}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold",
                "bg-[#8E1B1B] text-white hover:bg-[#6D1414] disabled:bg-gray-400"
              )}
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          </div>

          <div className="bg-white">
            {loading ? (
              <div className="p-6 text-sm text-[#6F675E]">Loading…</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {sorted.map((p) => (
                  <li
                    key={p._id}
                    draggable
                    onDragStart={() => setDragId(p._id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      move(dragId, p._id);
                      setDragId(null);
                    }}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4",
                      "hover:bg-[#FAF7F2] transition-colors",
                      dragId === p._id ? "opacity-60" : ""
                    )}
                  >
                    <div className="text-[#8E1B1B]">
                      <GripVertical size={18} />
                    </div>
                    <div className="w-10 text-xs font-bold text-[#6F675E] tabular-nums">
                      #{Number(p.displayOrder ?? 9999)}
                    </div>
                    <img
                      src={p.photo || p.photos?.[0]}
                      alt=""
                      className="h-10 w-10 rounded object-cover border"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1F1B16] truncate">{p.name}</p>
                      <p className="text-xs text-[#6F675E]">
                        {p.productType === "combo" ? "Combo" : "Single"}
                        {p.showInCombosSection ? " • Shown in Combos" : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

