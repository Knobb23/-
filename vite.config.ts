import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Determine base path:
  // 1. Explicit VITE_BASE_PATH if provided
  // 2. GitHub repository path if running in GitHub Actions (GITHUB_REPOSITORY = "owner/repo" -> "/repo/")
  // 3. Root '/' for Firebase Hosting, Vercel, Netlify, Cloud Run, and local development
  const repoName = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/';
  const base = process.env.VITE_BASE_PATH || repoName;

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
