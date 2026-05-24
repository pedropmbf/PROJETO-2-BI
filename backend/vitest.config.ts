import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts'],
    reporters: [
      'default',
      ['html', { outputFile: './test-report/index.html' }],
      ['json', { outputFile: './test-report/results.json' }],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/routes/**', 'src/middlewares/**', 'src/utils/**'],
      exclude: ['src/tests/**', 'src/server.ts'],
    },
  },
});
