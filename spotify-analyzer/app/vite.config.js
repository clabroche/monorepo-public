import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import EnvironmentPlugin from 'vite-plugin-environment'
import ViteRestart from 'vite-plugin-restart'
const packagejson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'))

const hash = Math.floor(Math.random() * 90000) + 10000;
const packagesToTransform = getPackagesToTransform()
console.log('==============================================')
console.log('Additional packages to transpiles and watch: ')
console.log(packagesToTransform.map(pack => `!**/node_modules/${pack}/**`))
console.log('==============================================')
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    commonjsOptions: {
      include: process.env.NODE_ENV === 'production' ? [] : [
        ...packagesToTransform.map(pack => new RegExp(pack)),
        /node_modules/
      ]
    },
    rollupOptions: {
      output: {
        entryFileNames: `[name]` + hash + `.js`,
        chunkFileNames: `[name]` + hash + `.js`,
        assetFileNames: `[name]` + hash + `.[ext]`
      }
    }
  },
  plugins: [
    ViteRestart.default({
      restart: [
        ...packagesToTransform.map(pack => `node_modules/${pack}/src/**`),
      ]
    }),
    vue(),
    EnvironmentPlugin('all', { prefix: 'VUE_APP_' }),
    EnvironmentPlugin('all', { prefix: 'VITE_APP_' }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "~": path.resolve("node_modules"),
      "@": path.resolve("src")
    }
  },
  server: {
    host: true,
    watch: {
      followSymlinks: true,
      ignored: [
        ...packagesToTransform.map(pack => `!**/node_modules/${pack}/**`)
      ]
    }
  },
  define: {
    // env: {},
    // process: { env: {} },
  },
  optimizeDeps: {
    include: packagesToTransform,
    link: packagesToTransform
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/assets/theme/index";`
      }
    }
  },
})


function getPackagesToTransform() {
  const localNodemodules = path.resolve('node_modules', '@clabroche')
  const allfoldersToWatch = [
    ...fs.readdirSync(localNodemodules).map(a => path.resolve(localNodemodules, a)),
  ]
  const packagesToTransform = allfoldersToWatch
    .filter(folder => {
      return packagejson.name !== `@clabroche/${path.basename(folder)}`
    })
    .map(a => `@clabroche/${path.basename(a)}`)
  return packagesToTransform
}

