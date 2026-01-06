import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminFooter from '../components/admin/AdminFooter';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // This key is crucial for AnimatePresence
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* The Outlet component renders the current admin page (Dashboard, Order, etc.) */}
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
