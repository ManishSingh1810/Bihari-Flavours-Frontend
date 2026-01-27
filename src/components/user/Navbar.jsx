import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../Context/userContext";
import logo from "../../assets/logo.png";
import HeaderSearch from "./header/HeaderSearch";
import HeaderCartButton from "./header/HeaderCartButton";

/* ---------------- Icons ---------------- */

/* Menu */
const MenuIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...p}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...p}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* Home */
const HomeIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

// Cart icon + badge is now a separate component: `HeaderCartButton`

/* Products – softened */
const ProductsIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M6 2l-3 4v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

/* Orders – list-style, lighter */
const OrdersIcon = (p) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h10" />
    <path d="M7 12h6" />
    <path d="M7 16h4" />
  </svg>
);

const MotionNavLink = motion(NavLink);

/* ---------------- Header ---------------- */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  /* Lock body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition
     border ${
       isActive
         ? "border-[#8E1B1B] text-[#8E1B1B]"
         : "border-transparent text-[#1F1B16] hover:border-[rgba(142,27,27,0.25)]"
     }`;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 h-16 sm:h-20
                 bg-white
                 border-b border-[rgba(142,27,27,0.25)]"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <MotionNavLink to="/" className="flex items-center gap-3">
          <img src={logo} alt="Bihari Flavours" className="h-10 sm:h-12" />
          <h2 className="text-lg sm:text-xl font-semibold text-[#8E1B1B]">
            Bihari Flavours
          </h2>
        </MotionNavLink>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-3">
          <HeaderSearch />

          {/* ✅ Home button */}
          <MotionNavLink to="/" className={navLinkClass}>
            <HomeIcon className="h-4 w-4" /> Home
          </MotionNavLink>

          <MotionNavLink to="/product" className={navLinkClass}>
            <ProductsIcon className="h-4 w-4" /> Products
          </MotionNavLink>

          <MotionNavLink to={user ? "/order" : "/login"} className={navLinkClass}>
            <OrdersIcon className="h-4 w-4" /> Orders
          </MotionNavLink>

          <HeaderCartButton />

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm hover:text-[#8E1B1B]"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-2 text-sm hover:text-[#8E1B1B]"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Actions (Search + Cart + Menu) */}
        <div className="lg:hidden flex items-center gap-1">
          <HeaderSearch />
          <HeaderCartButton />
          <button
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg
                       border border-transparent hover:border-[rgba(142,27,27,0.25)]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed right-0 z-40
                     top-16 sm:top-20
                     h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)]
                     w-64 bg-white
                     border-l border-[rgba(142,27,27,0.25)]
                     lg:hidden"
        >
          <div className="flex flex-col space-y-2 px-4 py-6">
            {/* ✅ Home button (mobile) */}
            <NavLink
              to="/"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              <HomeIcon className="h-4 w-4" /> Home
            </NavLink>

            <NavLink
              to="/product"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              <ProductsIcon className="h-4 w-4" /> Products
            </NavLink>

            <NavLink
              to={user ? "/order" : "/login"}
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              <OrdersIcon className="h-4 w-4" /> Orders
            </NavLink>

            <NavLink
              to="/cart"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {/* Cart badge shown near hamburger (header); this is just the menu link */}
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
              </span>{" "}
              Cart
            </NavLink>

            {/* Optional: show Login/Logout inside mobile menu too (nice UX) */}
            {user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition
                           border border-transparent text-[#1F1B16] hover:text-[#8E1B1B]
                           hover:border-[rgba(142,27,27,0.25)] text-left"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition
                           border border-transparent text-[#1F1B16] hover:text-[#8E1B1B]
                           hover:border-[rgba(142,27,27,0.25)] text-left"
              >
                Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
} 

