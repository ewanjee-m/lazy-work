import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const markdownAsRaw: Plugin = {
  name: 'markdown-as-raw',
  enforce: 'pre',
  transform(_code, id) {
    if (id.endsWith('.md')) {
      const content = fs.readFileSync(id, 'utf-8');
      return { code: `export default ${JSON.stringify(content)};`, map: null };
    }
    return null;
  },
};

export default defineConfig({
  plugins: [markdownAsRaw, react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
