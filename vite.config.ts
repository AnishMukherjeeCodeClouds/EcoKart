import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        product: "product.html",
        cart: "cart.html",
        confirmed: "confirmed.html",
      },
    },
  },
});
