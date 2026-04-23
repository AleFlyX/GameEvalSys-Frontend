import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import vue from "@vitejs/plugin-vue";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import vueDevTools from "vite-plugin-vue-devtools";
import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载对应 mode 的环境变量
  const env = loadEnv(mode, process.cwd());
  const enableMock = env.VITE_USE_MOCK === "true";

  const plugins = [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router"],
      resolvers: [ElementPlusResolver({ directives: true })],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: "css", directives: true })],
      dts: "src/components.d.ts",
    }),
    vueDevTools(),
  ];

  // 仅当开启 Mock 时添加 mockDevServerPlugin
  if (enableMock) {
    plugins.push(
      mockDevServerPlugin({
        mockPath: "mock", // mock数据目录
        watchFiles: true, // 监听mock数据目录变化，自带更新
        reload: false, // mock数据变化时是否自动刷新页面
        prefix: "/api/v1",
      })
    );
  }

  return {
    plugins,
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
          rewrite: (path) => path.replace(/^\/api\/v1/, ""), // 去掉前缀（若后端无该前缀）
        },
      },
    },
    // 打包配置
    build: {
      outDir: "./deploy/dist",
      chunkSizeWarningLimit: 1500, // 解决打包体积过大警告
      // rollupOptions: { ... },
    },
  };
});
