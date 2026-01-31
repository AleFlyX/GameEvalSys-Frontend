// import LoginPage from "@/pages/public/login/LoginPage.vue"
const Login = () => import("@/pages/public/login/LoginPage.vue");
const Forbidden = () => import("@/pages/public/403/ForbiddenPage.vue");
const NotFound = () => import("@/pages/public/404/NotFound.vue");
// 后台主布局（admin/normal页面共用）
const MainLayout = () => import("@/layouts/MainLayout.vue");
export const pub = [
  {
    path: "/",
    name: "MainLayout",
    component: MainLayout,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/403",
    name: "403Forbidden",
    component: Forbidden,
  },
  {
    path: "/404",
    name: "404NotFound",
    component: NotFound,
  },
];
