import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../Context/userContext";

const CartIcon = (p) => (
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
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
);

export default function HeaderCartButton({ className = "", onClick }) {
  const navigate = useNavigate();
  const { isLoggedIn, cartItemCount } = useUser();

  const goToCart = () => {
    if (onClick) onClick();
    navigate(isLoggedIn ? "/cart" : "/login");
  };

  return (
    <button
      type="button"
      onClick={goToCart}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg
                  border border-transparent text-[#1F1B16]
                  hover:border-[rgba(142,27,27,0.25)] hover:text-[#8E1B1B]
                  transition ${className}`}
      aria-label="Cart"
    >
      <CartIcon />

      {cartItemCount > 0 && (
        <span
          className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#8E1B1B]
                     px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
        >
          {cartItemCount}
        </span>
      )}
    </button>
  );
}

