import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import vue from "@vitejs/plugin-vue";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import vueDevTools from "vite-plugin-vue-devtools";
import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载对应 mode 的环境变量
  const env = loadEnv(mode, process.cwd());
  const enableMock = env.VITE_USE_MOCK === "true";
  const isBuildCommand = command === "build";

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
    esbuild: isBuildCommand
      ? {
        drop: ["console"],
      }
      : undefined,
    plugins,
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: "./deploy/dist",
      chunkSizeWarningLimit: 1500, // 解决打包体积过大警告
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("element-plus")) return "vendor-element-plus";
              if (id.includes("@element-plus/icons-vue")) return "vendor-element-icons";
              if (id.includes("echarts")) return "vendor-echarts";
              if (id.includes("xlsx")) return "vendor-xlsx";
              if (id.includes("page-agent")) return "vendor-page-agent";
              if (id.includes("vue-router")) return "vendor-vue-router";
              if (id.includes("pinia")) return "vendor-pinia";
              if (id.includes("axios")) return "vendor-axios";
              return "vendor";
            }

            if (id.includes("/src/layouts/")) return "layout";
            if (id.includes("/src/pages/public/")) return "page-public";
            if (id.includes("/src/pages/normal/")) return "page-normal";
            if (id.includes("/src/pages/admin/")) return "page-admin";
            if (id.includes("/src/pages/super-admin/")) return "page-super-admin";
            if (id.includes("/src/test/")) return "page-test";

            return undefined;
          },
        },
      },
    },
    server: {
      host: true,
      port: 5173, // 前端服务端口
      open: true, // 启动项目自动打开浏览器
      proxy: {
        // 匹配所有以/api/v1开头的请求，转发到后端
        "/api/v1": {
          target: "http://localhost:8080", // 后端开发地址
          changeOrigin: true, // 开启跨域
          ws: true, // 支持WebSocket
          rewrite: (path) => path.replace(/^\/api\/v1/, ""), // 去掉前缀（若后端无该前缀）
          // 反代给请求头添加X-Forwarded-For和X-Real-Ip
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const remoteAddress = req.socket?.remoteAddress || req.connection?.remoteAddress;
              const forwardedFor = req.headers["x-forwarded-for"]; // node 环境下的请求头键名会被改为小写：x-forwarded-for
              const existingForwardedFor = Array.isArray(forwardedFor)
                ? forwardedFor.join(", ")
                : forwardedFor;
              if (remoteAddress) {
                proxyReq.setHeader("X-Real-IP", remoteAddress);
                proxyReq.setHeader(
                  "X-Forwarded-For",
                  existingForwardedFor ? `${existingForwardedFor}, ${remoteAddress}` : remoteAddress
                );
              }
              console.log(remoteAddress, req.headers["x-forwarded-for"], req.headers["x-real-ip"])
            });
          },
        },
      },
    },
  };
});
