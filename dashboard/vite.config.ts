import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/cde/",
    plugins: [react()],
    resolve: {
      alias: {
        "@cuur/core": path.resolve(__dirname, "../packages/core/src"),
      },
    },
    server: {
      port: 5174,
      host: "0.0.0.0",
      open: false,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
    // Explicitly define the env var to ensure it's available
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL || "http://34.136.153.216:3001"
      ),
    },
  };
});
