import { defineConfig, type Plugin } from 'vite'

const buildId = Date.now().toString(36)

function buildInfo(): Plugin {
  return {
    name: 'cobalt-build-info',
    generateBundle(_options, bundle) {
      this.emitFile({
        type: 'asset',
        fileName: 'build.json',
        source: JSON.stringify({ id: buildId, builtAt: new Date().toISOString() }),
      })
      const files = Object.values(bundle)
        .map((item) => item.fileName)
        .filter((name) => /\.(js|css|woff2|png|svg|json|webmanifest)$/.test(name))
      this.emitFile({
        type: 'asset',
        fileName: 'precache.json',
        source: JSON.stringify({ id: buildId, files: files.map((name) => `./${name}`) }),
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
