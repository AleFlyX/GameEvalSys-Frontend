import { createApp } from "vue";
import "@/assets/main.css";
import pinia from "./stores/index.js";

import App from "./App.vue";
import router from "./router";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import service from "@/utils/request.js";

const app = createApp(App);

// 挂载Element Plus图标（全局注册，可直接使用）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(pinia); //store
app.use(router);
app.use(ElementPlus);

export const useRequest = () => service; //封装的axios

app.mount("#app");
