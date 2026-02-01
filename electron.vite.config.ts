import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

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
        '@': resolve('src/renderer/src'),
        '#/main': resolve('src/main'),
        '#/preload': resolve('src/preload'),
        '#/shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
})
