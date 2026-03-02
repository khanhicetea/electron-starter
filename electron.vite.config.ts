import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '#/main': resolve('src/main'),
        '#/preload': resolve('src/preload'),
        '#/shared': resolve('src/shared')
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '#/main': resolve('src/main'),
        '#/preload': resolve('src/preload'),
        '#/shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '#/main': resolve('src/main'),
        '#/preload': resolve('src/preload'),
        '#/shared': resolve('src/shared')
      }
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: resolve('src/renderer/routes'),
        generatedRouteTree: resolve('./src/renderer/routes/routeTree.gen.ts')
      }),
      react(),
      tailwindcss()
    ]
  }
})
