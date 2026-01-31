import { createRouter, createWebHistory } from "vue-router";
import { comn } from "@/router/commonRoutes";
import { pub } from "@/router//publicRoutes";
// const routes = [...comn];
// routes.push(pub);
const routes = [...pub];
console.log("_RoutesLoaded_", routes);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
