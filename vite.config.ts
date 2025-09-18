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
  server: {
    allowedHosts: ["2e09b4284d19.ngrok-free.app"],
  },
});
