import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/cde/",
  plugins: [react()],
  resolve: {
    alias: {
      "@cuur/core": path.resolve(__dirname, "../packages/core/src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
