## 业务组件可自动引入，跨模块关键组件可显式 import

因为在vite.config.js中做了配置

```js
    AutoImport({
      imports: ["vue", "vue-router"],
      resolvers: [ElementPlusResolver({ directives: true })],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: "css", directives: true })],
      dts: "src/components.d.ts",
    }),
```
