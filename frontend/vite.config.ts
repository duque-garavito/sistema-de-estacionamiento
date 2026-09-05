import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@core', replacement: path.resolve(__dirname, 'src/modules/core') },
      { find: '@modules', replacement: path.resolve(__dirname, 'src/modules') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
      { find: '@routes', replacement: path.resolve(__dirname, 'src/routes') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
