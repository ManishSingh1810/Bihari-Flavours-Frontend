import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useUser } from "../../Context/userContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const AdminNavbar = () => {
  const { logout } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

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
