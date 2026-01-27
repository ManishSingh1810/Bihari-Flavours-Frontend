import React, { useState, useEffect, useRef } from "react";
import { LogOut, Bell } from "lucide-react";
import { useUser } from "../../Context/userContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import api from "../../api/axios";

const AdminNavbar = () => {
  const { logout } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch pending orders count
  const fetchPendingOrders = async () => {
    try {
      const res = await api.get("/admin/order", { skipErrorToast: true });
      const orders = res?.data?.orders || [];
      setPendingCount(orders.length);
      // Get 5 most recent orders
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch pending orders:", err);
    }
  };

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setError(null);
      await logout(); // calls backend /api/users/logout (and aliases)
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  return (
    <header
      className="sticky top-0 z-50
                 h-16 sm:h-20
                 bg-white
                 border-b border-[rgba(142,27,27,0.25)]"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bihari Flavours" className="h-10 sm:h-12" />

          <h2 className="text-lg sm:text-xl font-semibold text-[#8E1B1B]">
            Bihari Flavours
          </h2>

          <span className="ml-2 rounded-md bg-[#F3EFE8] px-2 py-0.5 text-xs text-[#6F675E] border border-[rgba(142,27,27,0.15)]">
            Admin
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <p className="hidden md:block text-xs italic text-[#6F675E]">
            "The land that gave the world its first republic."
          </p>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative inline-flex items-center justify-center
                         h-9 w-9 rounded-md
                         border border-transparent
                         text-[#6F675E]
                         transition
                         hover:bg-[rgba(142,27,27,0.05)] hover:border-[rgba(142,27,27,0.25)]"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1
                                 flex h-5 w-5 items-center justify-center
                                 rounded-full bg-[#8E1B1B]
                                 text-[10px] font-semibold text-white
                                 ring-2 ring-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2
                              w-80 rounded-2xl
                              border border-black/5
                              bg-white shadow-lg
                              overflow-hidden z-50">
                <div className="bg-[#F3EFE8] px-4 py-3 border-b border-black/5">
                  <h3 className="text-sm font-semibold text-[#1F1B16]">
                    Pending Orders {pendingCount > 0 && `(${pendingCount})`}
                  </h3>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {recentOrders.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-[#6F675E]">
                      No pending orders
                    </div>
                  ) : (
                    <div className="divide-y divide-black/5">
                      {recentOrders.map((order) => (
                        <button
                          key={order._id}
                          onClick={() => {
                            setShowDropdown(false);
                            navigate("/admin/order");
                          }}
                          className="w-full px-4 py-3 text-left
                                     hover:bg-[#F8FAFC] transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#1F1B16] truncate">
                                {order.address?.name || "Customer"}
                              </p>
                              <p className="text-xs text-[#6F675E] mt-0.5">
                                {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                                {" · "}
                                Rs. {order.totalAmount || 0}
                              </p>
                            </div>
                            <span className="text-xs text-[#8E1B1B] font-medium whitespace-nowrap">
                              New
                            </span>
                          </div>
                          <p className="text-xs text-[#6F675E]/80 mt-1">
                            {order.paymentMethod || "COD"}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {pendingCount > 0 && (
                  <div className="border-t border-black/5 px-4 py-3">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/admin/order");
                      }}
                      className="w-full rounded-md bg-[#8E1B1B]
                                 px-3 py-2 text-sm font-medium text-white
                                 transition hover:bg-[#7A1717]"
                    >
                      View All Orders
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2
                       rounded-md border border-[#8E1B1B]
                       px-3 py-2 text-sm
                       text-[#8E1B1B]
                       transition
                       hover:bg-[rgba(142,27,27,0.05)]"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="absolute left-1/2 top-full mt-2
                     -translate-x-1/2
                     rounded-md
                     bg-[#8E1B1B]
                     px-4 py-2 text-sm text-white
                     shadow-lg"
        >
          {error}
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
