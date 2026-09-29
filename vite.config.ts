import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Assets v Replitu bývají o dvě složky výše, 
      // pokud je nemáš stažené tam, možná budeš muset tuhle cestu později upravit
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: __dirname,
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
});
