import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/*.{js,ts}', 'src/**/*.{spec,test}.{js,ts}']
  },
  // 避免加载项目中的 Vite 插件
  plugins: []
});
