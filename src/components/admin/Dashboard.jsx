import React from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  History,
  ArrowRight,
  ShoppingBag,
  Tag,
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-12 text-center text-3xl font-semibold text-[#1F1B16]">
          Admin Dashboard
        </h1>

        <div className="grid gap-6 sm:grid-cols-2">

          {/* Product Management */}
          <Link
            to="/admin/products"
            className="group rounded-lg border
                       border-[rgba(142,27,27,0.25)]
                       bg-[#F3EFE8] p-6 transition
                       hover:bg-[#FAF7F2]"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-md border
                              border-[rgba(142,27,27,0.25)]
                              p-3 text-[#8E1B1B]">
                <ShoppingBag size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#1F1B16]">
                  Manage Products
                </h2>
                <p className="mt-1 text-sm text-[#6F675E]">
                  Add, update, or remove products from the catalogue.
                </p>
              </div>

              <ArrowRight
                className="mt-1 text-[#6F675E]
                           transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>

          {/* Coupon Management */}
          <Link
            to="/admin/coupons"
            className="group rounded-lg border
                       border-[rgba(142,27,27,0.25)]
                       bg-[#F3EFE8] p-6 transition
                       hover:bg-[#FAF7F2]"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-md border
                              border-[rgba(142,27,27,0.25)]
                              p-3 text-[#8E1B1B]">
                <Tag size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#1F1B16]">
                  Manage Coupons
                </h2>
                <p className="mt-1 text-sm text-[#6F675E]">
                  Create and manage discount codes.
                </p>
              </div>

              <ArrowRight
                className="mt-1 text-[#6F675E]
                           transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>

          {/* Pending Orders */}
          <Link
            to="/admin/order"
            className="group rounded-lg border
                       border-[rgba(142,27,27,0.25)]
                       bg-[#F3EFE8] p-6 transition
                       hover:bg-[#FAF7F2]"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-md border
                              border-[rgba(142,27,27,0.25)]
                              p-3 text-[#8E1B1B]">
                <Clock size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#1F1B16]">
                  Pending Orders
                </h2>
                <p className="mt-1 text-sm text-[#6F675E]">
                  Review and process new orders.
                </p>
              </div>

              <ArrowRight
                className="mt-1 text-[#6F675E]
                           transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>

          {/* Order History */}
          <Link
            to="/admin/history"
            className="group rounded-lg border
                       border-[rgba(142,27,27,0.25)]
                       bg-[#F3EFE8] p-6 transition
                       hover:bg-[#FAF7F2]"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-md border
                              border-[rgba(142,27,27,0.25)]
                              p-3 text-[#8E1B1B]">
                <History size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#1F1B16]">
                  Order History
                </h2>
                <p className="mt-1 text-sm text-[#6F675E]">
                  View completed and cancelled orders.
                </p>
              </div>

              <ArrowRight
                className="mt-1 text-[#6F675E]
                           transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
