import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // ✅ ADDED — Tailwind v4 Vite-native plugin
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ✅ ADDED — replaces PostCSS approach entirely
  ],

  resolve: {
    alias: [
      // ✅ CHANGED: Array form with specific aliases BEFORE the catch-all "@"
      // This prevents "@" from greedily matching "@api", "@components", etc.
      { find: "@api", replacement: path.resolve(__dirname, "./src/api") },
      { find: "@components", replacement: path.resolve(__dirname, "./src/components") },
      { find: "@features", replacement: path.resolve(__dirname, "./src/features") },
      { find: "@hooks", replacement: path.resolve(__dirname, "./src/hooks") },
      { find: "@store", replacement: path.resolve(__dirname, "./src/store") },
      { find: "@lib", replacement: path.resolve(__dirname, "./src/lib") },
      { find: "@types", replacement: path.resolve(__dirname, "./src/types") },
      { find: "@", replacement: path.resolve(__dirname, "./src") }, // ✅ LAST — catch-all
    ],
  },

  server: {
    port: 5173,
  },
});