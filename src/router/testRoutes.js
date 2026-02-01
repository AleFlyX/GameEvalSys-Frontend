import DashboardHome from "@/pages/DashboardHome.vue";
import JudgePage from "@/pages/JudgePage.vue";

export const comn = [
  {
    path: "/dashboard",
    name: "控制面板",
    component: DashboardHome,
  },
  {
    path: "/judgePage",
    name: "项目评分",
    component: JudgePage,
  },

  // {
  //   path: '/about',
  //   name: '关于',
  //   component: () => import('@/views/AboutView.vue'),
  // },
];
