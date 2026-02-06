// import LoginPage from "@/pages/public/login/LoginPage.vue"
const Login = () => import("@/pages/public/login/LoginPage.vue");
const Forbidden = () => import("@/pages/public/403/ForbiddenPage.vue");
const NotFound = () => import("@/pages/public/404/NotFound.vue");
// 后台主布局（admin/normal页面共用）
// const MainLayout = () => import("@/layouts/MainLayout.vue");
const MainLayout = () => import("@/layouts/MainLayout.vue");

import { admin } from "./adminRoutes";
import { norm } from "./normalRoutes";
export const pub = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "登录", requireAuth: false },
  },
  {
    path: "/",
    name: "MainLayout",
    component: MainLayout,
    meta: { requireAuth: true },
    redirect: "/home",
    children: [...norm, ...admin], //主界面的路由
  },
  {
    path: "/403",
    name: "403Forbidden",
    component: Forbidden,
    meta: { title: "无权限", requireAuth: false },
  },
  {
    path: "/404",
    name: "404NotFound",
    component: NotFound,
    meta: { title: "页面不存在", requireAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];
