import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Avoid Fast Refresh instrumentation while the preview runtime is incompatible.
  // Preview edits require a full reload; production builds are unchanged.
  server: { hmr: false },
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: "Calm Path",
        short_name: "Calm Path",
        description: "Calm Path",
        theme_color: '#1A1536',
        background_color: '#1A1536',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: { navigateFallback: '/index.html', cleanupOutdatedCaches: true },
    }),
  ],
});
