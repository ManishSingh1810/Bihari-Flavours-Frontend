import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Heart, Mail, Clock, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from "react-router-dom";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-white border-t border-[rgba(142,27,27,0.18)] text-[#1F1B16]"
    >
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Main Content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* About Us */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-2xl font-semibold tracking-wide text-[#8E1B1B]">
              About Bihari Flavours
            </h3>

            <p className="mb-4 max-w-2xl leading-relaxed">
              Bihari Flavours exists to preserve food that never needed branding —
              recipes shaped by seasons, festivals, and everyday hunger.
              These are flavours that stayed within homes, passed quietly from one
              generation to the next.
            </p>

            <p className="mb-4 max-w-2xl leading-relaxed">
              In Bihar, food is memory. It marks mornings before school,
              evenings on the floor with family, and long conversations that
              stretch past sunset. Our work is simple: to carry that honesty
              forward, without dilution.
            </p>

            <p className="max-w-2xl text-sm italic leading-relaxed text-[#6F675E]">
              What began as handwritten recipes and shared meals now travels farther —
              but the rhythm remains the same: slow, intentional, and rooted in home.
            </p>

            {/* Social Icons */}
            <div className="mt-8 flex space-x-4">
              {/* Instagram */}
              <motion.a
                href="https://instagram.com/bihariflavours18"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-9 w-9 items-center justify-center rounded-full
                           border border-[rgba(142,27,27,0.25)]
                           text-[#8E1B1B]
                           hover:bg-[rgba(142,27,27,0.05)] transition"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </motion.a>

              {/* WhatsApp */}
              <motion.a
                href="https://wa.me/9185211754329"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-9 w-9 items-center justify-center rounded-full
                           border border-[rgba(142,27,27,0.25)]
                           text-[#8E1B1B]
                           hover:bg-[rgba(142,27,27,0.05)] transition"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current">
    <path d="M16 .5C7.4.5.5 7.4.5 16c0 2.8.7 5.5 2.1 7.9L.4 31.6l7.9-2.1c2.3 1.3 5 2 7.7 2C24.6 31.5 31.5 24.6 31.5 16S24.6.5 16 .5zm0 29c-2.5 0-5-.7-7.1-2l-.5-.3-4.7 1.2 1.2-4.6-.3-.5C3.3 21 2.5 18.5 2.5 16 2.5 8.6 8.6 2.5 16 2.5S29.5 8.6 29.5 16 23.4 29.5 16 29.5zm7.3-9.1c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.6-.2-.9.2-.3.4-1 1.2-1.3 1.5-.2.3-.4.3-.8.1-2.3-1.1-3.8-2-5.4-4.5-.4-.6.4-.6 1.1-2 .1-.3.1-.6 0-.8-.1-.2-.9-2.2-1.2-3-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.9s1.7 4.6 1.9 4.9c.2.3 3.3 5 8 6.8 1.1.4 2 .7 2.7.9 1.1.3 2.1.3 2.9.2.9-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5z"/>
  </svg>

              </motion.a>
            </div>
          </motion.div>

          {/* Support & Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-5 text-xl font-semibold text-[#8E1B1B]">Business details</h4>

            <ul className="space-y-4 text-sm text-[#1F1B16]">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-[#8E1B1B]" />
                <span className="text-[#6F675E]">
                  Address: <span className="text-[#1F1B16]">Coming soon</span>
                  <span className="block text-xs text-[#6F675E] mt-1">
                    (For support, contact us on WhatsApp / Email)
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#8E1B1B]" />
                <a
                  href="tel:+9185211754329"
                  className="hover:text-[#8E1B1B] transition"
                >
                  +91 85211 754329
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#8E1B1B]" />
                <a
                  href="mailto:support@bihariflavours.in"
                  className="hover:text-[#8E1B1B] transition"
                >
                  support@bihariflavours.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#8E1B1B]" />
                <span>Monday – Friday, 9:00 AM to 6:00 PM</span>
              </li>
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:items-end md:text-right"
          >
            <h4 className="mb-5 text-xl font-semibold text-[#8E1B1B]">
              Policies & links
            </h4>

            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/product" },
                { label: "Orders", href: "/order" },
                { label: "Cart", href: "/cart" },
                { label: "Shipping", href: "/shipping" },
                { label: "Returns", href: "/returns" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[#1F1B16] transition hover:text-[#8E1B1B]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Bottom Line + Legal */}
        <div className="mt-16 pt-8 border-t border-[rgba(142,27,27,0.15)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center justify-center gap-2 text-center text-sm text-[#6F675E] sm:justify-start">
              Made with <Heart className="h-4 w-4 text-[#8E1B1B]" /> in Bihar • ©{" "}
              {new Date().getFullYear()} Bihari Flavours
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-[#6F675E] sm:justify-end">
              <Link to="/shipping" className="hover:text-[#8E1B1B] transition">
                Shipping
              </Link>
              <span className="opacity-40">•</span>
              <Link to="/returns" className="hover:text-[#8E1B1B] transition">
                Returns
              </Link>
              <span className="opacity-40">•</span>
              <Link to="/privacy-policy" className="hover:text-[#8E1B1B] transition">
                Privacy
              </Link>
              <span className="opacity-40">•</span>
              <Link to="/terms" className="hover:text-[#8E1B1B] transition">
                Terms
              </Link>
            </div>
          </div>
        </div>

      </div>
    </motion.footer>
  );
};

export default Footer;






