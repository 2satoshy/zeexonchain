import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.CDP_PROJECT_ID': JSON.stringify(process.env.CDP_PROJECT_ID || process.env.VITE_CDP_PROJECT_ID || ''),
      'process.env.BASE_PAYMASTER_MAINNET': JSON.stringify(process.env.BASE_PAYMASTER_MAINNET || ''),
      'process.env.BASE_PAYMASTER_SEPOLIA': JSON.stringify(process.env.BASE_PAYMASTER_SEPOLIA || ''),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
