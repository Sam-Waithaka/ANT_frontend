import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const scriptureApiProxyTarget =
    env.VITE_SCRIPTURE_API_PROXY_TARGET || env.VITE_SCRIPTURE_API_BASE_URL || 'http://localhost:8000'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/v1': {
          target: scriptureApiProxyTarget,
          changeOrigin: true,
          secure: !scriptureApiProxyTarget.startsWith('http://'),
        },
      },
    },
  }
})
