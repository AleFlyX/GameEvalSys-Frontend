import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173, // 前端服务端口
    open: true, // 启动项目自动打开浏览器
    proxy: {
      // 匹配所有以/api/v1开头的请求，转发到后端
      "/api/v1": {
        target: "http://localhost:8080", // 后端开发地址
        changeOrigin: true, // 开启跨域
        ws: true, // 支持WebSocket
        rewrite: (path) => path,
        // 路径重写（可选：如果后端基础路径也是/api/v1，可省略）
        // rewrite: (path) => path.replace(/^\/api\/v1/, "/api/v1"),
      },
    },
  },
  // 打包配置
  // build: {
  //   outDir: "dist", // 打包输出目录
  //   chunkSizeWarningLimit: 1500, // 解决打包体积过大警告
  //   rollupOptions: {
  //     // 打包分割（优化打包体积）
  //     output: {
  //       chunkFileNames: "js/[name]-[hash].js",
  //       entryFileNames: "js/[name]-[hash].js",
  //       assetFileNames: "[ext]/[name]-[hash].[ext]",
  //     },
  //   },
  // },
});
