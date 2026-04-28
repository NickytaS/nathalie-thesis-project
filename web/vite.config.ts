import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/** Must match CHAT_API_PORT in web/.env (loadEnv picks it up for the dev + preview proxies). */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const chatPort = env.CHAT_API_PORT || '5172';

  const apiProxy = {
    '/api': {
      target: `http://127.0.0.1:${chatPort}`,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: {
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
  };
});
