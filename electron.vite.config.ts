import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { mergeConfig } from 'vite';

import rendererConfig from './vite.config';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name]-[hash].cjs'
        }
      }
    }
  },
  renderer: mergeConfig(rendererConfig, {})
});
