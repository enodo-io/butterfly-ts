import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['(src|tests)/**/*.?(i)(test|spec).(ts|js|tsx)'],
    coverage: {
      enabled: true,
      include: ['src/**/*.ts', 'test/**/*.ts'],
      reporter: ['json-summary', 'lcov'],
    },
    watch: false,
  },
});
