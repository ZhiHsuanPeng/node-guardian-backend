import { loadEnv, defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
    env: loadEnv('test', process.cwd(), ''),
  },
});
