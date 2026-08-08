import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://smartabodelab.com",
  vite: { plugins: [tailwindcss()] }
});
