import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import process from "node:process";

const host = process.env.TAURI_DEV_HOST;
const isPagesBuild = process.env.GITHUB_ACTIONS === "true";

export default defineConfig(() => ({
  plugins: [react()],
  base: isPagesBuild ? "/APEX/" : "/",
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  build: {
    rolldownOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        enroll: resolve(process.cwd(), "enroll.html"),
      },
    },
  },
}));
