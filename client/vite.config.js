import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function faviconIcoRedirect() {
  const redirect = (req, res, next) => {
    const path = req.url?.split('?')[0]
    if (path !== '/favicon.ico') {
      next()
      return
    }
    res.statusCode = 302
    res.setHeader('Location', '/favicon.png?v=2')
    res.end()
  }
  return {
    name: 'favicon-ico-redirect',
    configureServer(server) {
      server.middlewares.use(redirect)
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), faviconIcoRedirect()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})