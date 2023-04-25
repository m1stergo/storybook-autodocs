import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node',
    outDir: 'dist',
    entry: './src/index.js',
  },
});
