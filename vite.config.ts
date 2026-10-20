import { defineConfig, type Plugin } from 'vite'

const buildId = Date.now().toString(36)

function buildInfo(): Plugin {
  return {
    name: 'cobalt-build-info',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'build.json',
        source: JSON.stringify({ id: buildId, builtAt: new Date().toISOString() }),
      })
    },
  }
}

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [buildInfo()],
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5273,
  },
})
