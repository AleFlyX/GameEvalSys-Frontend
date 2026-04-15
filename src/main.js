import { createApp } from "vue";
import "@/assets/main.css";
import "element-plus/es/components/loading/style/css";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
import pinia from "./stores/index.js";
import App from "./App.vue";
import router from "./router";

import service from "@/utils/request.js";

const app = createApp(App);

app.use(pinia); //store
app.use(router);

export const useRequest = () => service; //封装的axios

app.mount("#app");
