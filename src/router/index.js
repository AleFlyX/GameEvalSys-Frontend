import { createRouter, createWebHistory } from "vue-router";

import { pub } from "@/router/modules/publicRoutes";

const routes = [...pub];
console.log("_RoutesLoaded_", routes);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
