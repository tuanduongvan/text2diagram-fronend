import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  define: {
    'process.env.IS_PREACT': JSON.stringify('true')
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
