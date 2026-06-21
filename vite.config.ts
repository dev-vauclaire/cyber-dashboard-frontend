import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/coverage/**',
          'Dockerfile',
          '**/tests/**',
          '**/vite.config.ts',
          '**/tsconfig.json',
          '**/package.json',
          '**/package-lock.json',
          '**/yarn.lock',
          'LICENSE',
          'README.md'
        ],
      },
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
      port: 5174,
    },
  };
});
