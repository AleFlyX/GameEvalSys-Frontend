import { createApp } from "vue";

import pinia from "./stores/index.js";

import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import service from "@/utils/request.js";

const app = createApp(App);
app.use(pinia); //store

app.use(ElementPlus);

app.use(router);

export const useRequest = () => service; //封装的axios

app.mount("#app");
