import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
// export default defineConfig({
//   plugins: [react()],
// });

// https://vite.dev/config/
export default defineConfig({ 

  plugins: [
    react(),
     tailwindcss(),

    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.js", // Service worker source
      workbox: {
        swSrc: "src/service-worker.js", // Custom service worker
        swDest: "sw.js", // Output service worker to root
      },
      devOptions: {
        enabled: true, // Enable PWA in development mode
        type: "module",
      },
      scope: "/", // Set scope for the PWA
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Ganesh Driving School",
        short_name: "Ganesh Driving School",
        description: "Digital system of learning.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        start_url: "/",
        display: "fullscreen",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
