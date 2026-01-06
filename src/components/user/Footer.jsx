import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Heart } from 'lucide-react';

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
      className="bg-[#FAF7F2] border-t border-[rgba(142,27,27,0.25)] text-[#1F1B16]"
    >
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Main Content */}
        <div className="grid gap-12 md:grid-cols-[2fr_1fr]">

          {/* About Us */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-2xl font-semibold tracking-wide text-[#8E1B1B]">
              About Us
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

            <div className="mt-8 flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full
                             border border-[rgba(142,27,27,0.25)]
                             text-[#8E1B1B]
                             hover:bg-[rgba(142,27,27,0.05)] transition"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links (Right-Aligned) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-end text-right"
          >
            <h4 className="mb-5 text-xl font-semibold text-[#8E1B1B]">
              Quick Links
            </h4>

            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/product" },
                { label: "Orders", href: "/order" },
                { label: "Cart", href: "/cart" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#1F1B16] transition hover:text-[#8E1B1B]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Bottom Line */}
        <p className="mt-20 flex items-center justify-center gap-2 text-center text-sm text-[#6F675E]">
          Made with <Heart className="h-4 w-4 text-[#8E1B1B]" /> for Bihar • © {new Date().getFullYear()} Bihari Flavours
        </p>

      </div>
    </motion.footer>
  );
};

export default Footer;
