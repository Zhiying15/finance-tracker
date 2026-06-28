import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: [
      // Specific aliases BEFORE the catch-all "@" to prevent prefix collision
      { find: "@api",        replacement: path.resolve(__dirname, "./src/api")        },
      { find: "@components", replacement: path.resolve(__dirname, "./src/components") },
      { find: "@features",   replacement: path.resolve(__dirname, "./src/features")   },
      { find: "@hooks",      replacement: path.resolve(__dirname, "./src/hooks")      },
      { find: "@store",      replacement: path.resolve(__dirname, "./src/store")      },
      { find: "@lib",        replacement: path.resolve(__dirname, "./src/lib")        },
      { find: "@types",      replacement: path.resolve(__dirname, "./src/types")      },
      { find: "@pages",      replacement: path.resolve(__dirname, "./src/pages")      },
      { find: "@",           replacement: path.resolve(__dirname, "./src")            },
    ],
  },

  server: {
    port: 5173,
  },
});