import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Trash2, ArrowLeft, X } from "lucide-react";
import api from "../../api/axios";

const CouponManager = () => {
  const { register, handleSubmit, reset } = useForm();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ================= FETCH ================= */

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coupons");
      if (res.data.success) {
        setCoupons(res.data.coupons);
        setError(null);
      } else {
        setError("Failed to fetch coupons");
      }
    } catch {
      setError("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */

  const onSubmit = async (data) => {
    try {
      setUpdating(true);
      const res = await api.post("/coupons", {
        code: data.code.toUpperCase(),
        discountPercentage: Number(data.discountPercentage),
        minPurchase: Number(data.minPurchase),
        maxPurchase: Number(data.maxPurchase),
        usageLimit: Number(data.usageLimit),
      });

      if (!res.data.success) throw new Error();

      setModalConfig({
        type: "info",
        message: `Coupon "${data.code.toUpperCase()}" created successfully.`,
      });
      setIsModalOpen(true);
      reset();
      fetchCoupons();
    } catch (err) {
      setModalConfig({
        type: "info",
        message:
          err.response?.data?.message || "Failed to create coupon",
      });
      setIsModalOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  /* ================= STATUS ================= */

  const toggleCouponStatus = async (id, currentStatus) => {
    try {
      setUpdating(true);
      await api.put(`/coupons/${id}`, {
        status: currentStatus === "active" ? "inactive" : "active",
      });
      fetchCoupons();
    } catch {
      setError("Failed to update coupon");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= DELETE ================= */

  const deleteCoupon = (id, code) => {
    setModalConfig({
      type: "confirm",
      message: `Delete coupon "${code}"? This cannot be undone.`,
      action: async () => {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
      },
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalConfig(null);
  };

  /* ================= MODAL ================= */

  const CustomModal = () => {
    if (!isModalOpen || !modalConfig) return null;
    const isConfirm = modalConfig.type === "confirm";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-xl bg-[#FAF7F2]
                        border border-[rgba(142,27,27,0.25)] p-6">
          <div className="mb-4 flex justify-between">
            <h4 className="text-lg font-semibold text-[#1F1B16]">
              {isConfirm ? "Confirm Action" : "Notice"}
            </h4>
            <button onClick={closeModal}>
              <X size={18} />
            </button>
          </div>

          <p className="mb-6 text-sm text-[#6F675E]">
            {modalConfig.message}
          </p>

          <div className="flex justify-end gap-3">
            {isConfirm ? (
              <>
                <button
                  onClick={closeModal}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await modalConfig.action();
                    closeModal();
                  }}
                  className="rounded-md bg-[#8E1B1B] px-4 py-2 text-sm text-white"
                >
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={closeModal}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-6 py-16">
      <CustomModal />

      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#6F675E] hover:text-[#1F1B16]"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <h1 className="mb-8 text-3xl font-semibold text-[#1F1B16]">
          Coupon Management
        </h1>

        {/* CREATE */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-10 grid gap-4 rounded-lg
                     border border-[rgba(142,27,27,0.25)]
                     bg-[#F3EFE8] p-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input {...register("code")} placeholder="Code" className="rounded-md p-3" />
          <input type="number" {...register("discountPercentage")} placeholder="Discount %" className="rounded-md p-3" />
          <input type="number" {...register("minPurchase")} placeholder="Min Purchase" className="rounded-md p-3" />
          <input type="number" {...register("maxPurchase")} placeholder="Max Purchase" className="rounded-md p-3" />
          <input type="number" {...register("usageLimit")} placeholder="Usage Limit" className="rounded-md p-3" />

          <button
            disabled={updating}
            className="rounded-md border border-[#8E1B1B]
                       bg-[#FAF7F2] px-6 py-3 text-[#8E1B1B]
                       hover:bg-[rgba(142,27,27,0.05)]"
          >
            Create Coupon
          </button>
        </form>

        {/* TABLE */}
        <div className="overflow-hidden rounded-lg border border-[rgba(142,27,27,0.25)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F3EFE8] text-left text-[#6F675E]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">Max</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr
                  key={c._id}
                  className="border-t hover:bg-[#FAF7F2]"
                >
                  <td className="px-4 py-3 font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.discountPercentage}%</td>
                  <td className="px-4 py-3">₹{c.minPurchase}</td>
                  <td className="px-4 py-3">
                    {c.maxPurchase === Number.MAX_SAFE_INTEGER
                      ? "∞"
                      : `₹${c.maxPurchase}`}
                  </td>
                  <td className="px-4 py-3">
                    {c.usedCount || 0}/{c.usageLimit}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleCouponStatus(c._id, c.status)}
                      className="text-sm text-[#8E1B1B]"
                    >
                      {c.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteCoupon(c._id, c.code)}
                      className="text-[#8E1B1B]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default CouponManager;
