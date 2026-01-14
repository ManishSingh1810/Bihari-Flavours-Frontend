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

        {/* 🔔 GLOBAL TOASTER */}
        <Toaster
          position="top"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1F1B16",
              color: "#FAF7F2",
              borderRadius: "10px",
              fontWeight: "500",
            },
          }}
        />

        <App />

      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
