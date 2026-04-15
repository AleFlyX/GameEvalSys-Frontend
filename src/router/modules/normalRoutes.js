
// normal页面（打分用户/普通用户，管理员也可访问）
const Home = () => import("@/pages/normal/home/HomePage.vue");
const ScoringList = () => import("@/pages/normal/scoring/list/index.vue");
const ProjectScoring = () => import("@/pages/normal/scoring/groups/index.vue");
import { test } from "./testRoutes";
const testRts = import.meta.env.VITE_SHOW_TEST_ROUTES === '1' ? test : []
export const norm = [
  ...testRts,
  // normal子路由（打分用户/管理员均可访问）
  {
    path: "home",
    name: "首页",
    component: Home,
    meta: { title: "首页", roles: ["super_admin", "admin", "scorer", "normal"], icon: 'HomeFilled' }, // 可访问角色
  },
  {
    path: "scoring",
    name: "打分列表",
    component: ScoringList,
    meta: { title: "打分项目列表", roles: ["super_admin", "admin", "scorer"], icon: 'Edit' },
  },
  {
    path: "scoring/:projectId", //可通过route.params.projectId读取;
    name: "projectScoring",
    component: ProjectScoring,
    meta: { title: "项目打分", roles: ["super_admin", "admin", "scorer"], hidden: true },
  },
];

