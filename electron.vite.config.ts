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
      lib: {
        formats: ['cjs']
      },
      rollupOptions: {
        output: {
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name]-[hash].cjs'
        }
      }
    }
  },
  renderer: mergeConfig(rendererConfig, {})
});
