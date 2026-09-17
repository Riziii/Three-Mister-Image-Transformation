import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = (
    process.env.VITE_GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    process.env.VITE_API_KEY ||
    env.VITE_API_KEY ||
    process.env.API_KEY ||
    env.API_KEY ||
    ''
  ).trim();

  // Support Vercel (base is '/'), GitHub Pages repo path, or custom base
  const isVercel = Boolean(process.env.VERCEL);
  const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : undefined;
  const base = isVercel ? '/' : (process.env.BASE_URL || repoName || './');

  return {
    base,
    plugins: [react(), tailwindcss()],
    // Expose both VITE_ and GEMINI_ prefixed variables to client import.meta.env
    envPrefix: ['VITE_', 'GEMINI_'],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_API_KEY': JSON.stringify(apiKey),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      global: 'globalThis',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
