import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useUser } from "../../Context/userContext";
import { useNavigate } from "react-router-dom";

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
      className="sticky top-0 z-30
                 bg-[#FAF7F2]
                 border-b border-[rgba(142,27,27,0.25)]
                 px-6 py-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center
                       rounded-full border
                       border-[#8E1B1B]
                       text-sm font-semibold
                       text-[#8E1B1B]"
          >
            BF
          </div>

          <span className="text-lg font-semibold text-[#1F1B16]">
            Bihari Flavours
          </span>

          <span className="ml-3 rounded-md bg-[#F3EFE8] px-2 py-0.5 text-xs text-[#6F675E]">
            Admin
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          <p className="hidden md:block text-xs italic text-[#6F675E]">
            “The land that gave the world its first republic.”
          </p>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2
                       rounded-md border border-[#8E1B1B]
                       px-4 py-2 text-sm
                       text-[#8E1B1B]
                       transition
                       hover:bg-[rgba(142,27,27,0.05)]"
          >
            <LogOut size={16} />
            Logout
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
