import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../../Context/userContext";

export default function Account() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // ✅ Always go to top when opening Account
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // ✅ If not logged in, redirect to login (instead of showing blank)
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // ignore logout errors
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  // While redirecting
  if (!user) return null;

  return (
    <main className="bg-[#FAF7F2] text-[#1F1B16] min-h-[70vh]">
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-[rgba(142,27,27,0.2)] bg-white/60 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#8E1B1B]">
                My Account
              </h1>
              <p className="mt-1 text-sm text-[#6F675E]">
                Manage your profile and quick actions.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 sm:mt-0 rounded-md border border-[#8E1B1B] px-4 py-2 text-sm
                         text-[#8E1B1B] transition hover:bg-[rgba(142,27,27,0.06)]"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Profile */}
            <div className="rounded-xl border border-[rgba(142,27,27,0.15)] bg-[#FAF7F2] p-5">
              <h2 className="text-lg font-semibold">Profile</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6F675E]">Name</span>
                  <span className="font-medium">
                    {user?.name || user?.username || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6F675E]">Email</span>
                  <span className="font-medium">{user?.email || "—"}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6F675E]">Phone</span>
                  <span className="font-medium">
                    {user?.phone || user?.mobile || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6F675E]">Role</span>
                  <span className="font-medium">{user?.role || "user"}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-xl border border-[rgba(142,27,27,0.15)] bg-[#FAF7F2] p-5">
              <h2 className="text-lg font-semibold">Quick Actions</h2>

              <div className="mt-4 grid gap-3">
                <button
                  onClick={() => navigate("/order")}
                  className="rounded-md border border-[rgba(142,27,27,0.25)]
                             bg-white/50 px-4 py-3 text-left text-sm transition
                             hover:bg-white"
                >
                  View Orders
                  <div className="text-xs text-[#6F675E] mt-1">
                    Track your purchases and status
                  </div>
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="rounded-md border border-[rgba(142,27,27,0.25)]
                             bg-white/50 px-4 py-3 text-left text-sm transition
                             hover:bg-white"
                >
                  Go to Cart
                  <div className="text-xs text-[#6F675E] mt-1">
                    Checkout or update quantities
                  </div>
                </button>

                <button
                  onClick={() => navigate("/product")}
                  className="rounded-md border border-[rgba(142,27,27,0.25)]
                             bg-white/50 px-4 py-3 text-left text-sm transition
                             hover:bg-white"
                >
                  Continue Shopping
                  <div className="text-xs text-[#6F675E] mt-1">
                    Explore all products
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
