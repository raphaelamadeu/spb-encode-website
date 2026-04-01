// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'spB Encode',
          short_name: 'spB',
          description: 'Sparkplug B Payload Encoder & Decoder',
          theme_color: '#2f0d68',
          background_color: '#2f0d68',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          navigateFallback: '/',
          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                request.destination === 'document',
              handler: 'NetworkFirst'
            },
            {
              urlPattern: ({ request }) =>
                request.destination === 'script' ||
                request.destination === 'style',
              handler: 'StaleWhileRevalidate'
            }
          ]
        }
      })
    ]
  },

  integrations: [react()]
});
