// import LoginPage from "@/pages/public/login/LoginPage.vue"
const Login = () => import("@/pages/public/login/LoginPage.vue");
const About = () => import("@/pages/public/about/index.vue");
const Forbidden = () => import("@/pages/public/403/ForbiddenPage.vue");
const NotFound = () => import("@/pages/public/404/NotFound.vue");
// 后台主布局（admin/normal页面共用）
const MainLayout = () => import("@/layouts/MainLayout.vue");

export const pub = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { title: "登录", requireAuth: false },
  },
  {
    path: "/",
    name: "mainLayout",
    component: MainLayout,
    meta: { requireAuth: true },
    redirect: "/home",
    // children will be injected dynamically after login according to role
    children: [
      {
        path: "home",
        name: "home",
        component: () => import("@/pages/normal/home/HomePage.vue"),
        meta: { title: "首页", requireAuth: true, staticFallback: true },
      },
    ],
  },
  {
    path: "/about",
    name: "about",
    component: About,
    meta: { title: "关于", requireAuth: false },
  },
  {
    path: "/403",
    name: "forbidden",
    component: Forbidden,
    meta: { title: "无权限", requireAuth: false },
  },
  {
    path: "/404",
    name: "notFound",
    component: NotFound,
    meta: { title: "页面不存在", requireAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

export default { pub };
