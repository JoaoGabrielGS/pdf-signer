import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      extensions: ['.vue', '.ts'],
      dts: 'src/typed-router.d.ts'
    }),
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      }
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  css: {
    devSourcemap: true
  }
})
