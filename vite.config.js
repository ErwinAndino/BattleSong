import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/BattleSong/' : './',
  root: '.',
  server: {
    port: 3000
  }
}));