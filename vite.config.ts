// R > vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // En local (dev) usamos "/" para que coincida con localhost:5173/
  // En build (GitHub Pages) usamos el subpath del repo.
  base: command === "build" ? "/Alarmero-vyu/" : "/",
}));
