import React from "react";
import { Heart } from "lucide-react";

const AdminFooter = () => {
  return (
    <footer
      className="mt-auto
                 bg-white
                 border-t border-[rgba(142,27,27,0.25)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center gap-3 text-center">

          {/* Quote */}
          <p className="text-sm italic text-[#6F675E]">
            "ज्ञान भूमि, कर्म भूमि — यही है बिहार"
          </p>
          <p className="text-xs text-[#6F675E]/80">
            (Land of knowledge, land of action — this is Bihar.)
          </p>

          {/* Divider */}
          <div className="my-2 h-px w-24 bg-[rgba(142,27,27,0.25)]" />

          {/* Copyright */}
          <p className="text-xs text-[#6F675E]">
            © {new Date().getFullYear()} Bihari Flavours · Admin Panel
          </p>

          <p className="flex items-center gap-1 text-xs text-[#6F675E]">
            Made with <Heart className="h-3 w-3 text-[#8E1B1B]" /> in Bihar
          </p>

        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
