import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // Polyfill Node's buffer module for browser-targeting wallet/CDP SDKs
        buffer: 'buffer',
      },
      dedupe: [
        '@coinbase/cdp-hooks',
        '@coinbase/cdp-react',
        '@coinbase/cdp-core',
        'react',
        'react-dom',
      ],
    },
    define: {
      // Expose env vars needed by server-side or legacy code referencing process.env
      'process.env.BASE_PAYMASTER_MAINNET': JSON.stringify(process.env.BASE_PAYMASTER_MAINNET || ''),
      'process.env.BASE_PAYMASTER_SEPOLIA': JSON.stringify(process.env.BASE_PAYMASTER_SEPOLIA || ''),
      // Required by 'buffer' polyfill
      global: 'globalThis',
    },
    optimizeDeps: {
      // Pre-bundle buffer & CDP packages together so Vite doesn't duplicate context modules
      include: [
        'buffer',
        '@coinbase/cdp-hooks',
        '@coinbase/cdp-react',
        '@coinbase/cdp-core',
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
