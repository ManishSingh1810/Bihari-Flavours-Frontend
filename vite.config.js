import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

// Enable HTTPS only if local cert files exist (works on your Mac, won't break Vercel)
function localHttpsIfAvailable() {
  try {
    return {
      https: {
        key: fs.readFileSync("./localhost-key.pem"),
        cert: fs.readFileSync("./localhost.pem"),
      },
    };
  } catch {
    return {}; // no https config in CI/production
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    ...localHttpsIfAvailable(),
    host: "localhost",
    port: 5173,
  },
});

