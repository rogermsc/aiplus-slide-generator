import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import path             from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../components'),
      '@types':      path.resolve(__dirname, '../types'),
    },
  },
  server: { port: 5173 },
});
