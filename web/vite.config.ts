import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const chatPort = process.env.CHAT_API_PORT || '5171';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${chatPort}`,
        changeOrigin: true,
      },
    },
  },
});
