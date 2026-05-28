import { createApp } from "vue";
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/assets/main.css";
import "element-plus/es/components/loading/style/css";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
import pinia from "./stores/index.js";
import App from "./App.vue";
import router from "./router";

import service from "@/utils/request.js";

// 这个文件定义了一个 Vue 指令 v-dev，用于在开发环境中根据全局开关和条件显示元素。
import devDirective from "@/directives/dev.js";

const app = createApp(App);

app.directive("dev", devDirective); //开发环境调试指令
app.use(pinia); //store
app.use(router);

export const useRequest = () => service; //封装的axios

app.mount("#app");
