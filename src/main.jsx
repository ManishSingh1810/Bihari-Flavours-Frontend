import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './Context/userContext';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import ScrollToTop from "./components/user/ScrollToTop";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ScrollToTop />

        {/* 🔔 GLOBAL TOASTER */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          // Must be ABOVE checkout/order modals (those use z-index ~100000)
          containerStyle={{ zIndex: 250000 }}
          toastOptions={{
            duration: 3500,
            style: {
              background: "#FFFFFF",
              color: "#0F172A",
              borderRadius: "14px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow:
                "0 12px 30px rgba(2, 6, 23, 0.12), 0 2px 8px rgba(2, 6, 23, 0.06)",
              padding: "12px 14px",
              fontWeight: 600,
            },
            success: {
              iconTheme: { primary: "#15803D", secondary: "#FFFFFF" },
              duration: 3000,
            },
            error: {
              iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
              duration: 4500,
            },
          }}
        />

        <App />

      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
