// normal页面（打分用户/普通用户，管理员也可访问）
const Home = () => import("@/pages/normal/home/HomePage.vue");
const ScoringList = () => import("@/pages/normal/scoring/ScoringList.vue");
const GroupScoring = () => import("@/pages/normal/scoring/GroupScoring.vue");

export const norm = [
  // normal子路由（打分用户/管理员均可访问）
  {
    path: "home",
    name: "home",
    component: Home,
    meta: { title: "首页", roles: ["super_admin", "admin", "scorer", "normal"] }, // 可访问角色
  },
  {
    path: "scoring",
    name: "scoringList",
    component: ScoringList,
    meta: { title: "打分项目列表", roles: ["super_admin", "admin", "scorer"] },
  },
  {
    path: "scoring/group/:projectId", //可通过route.params.projectId读取;
    name: "groupScoring",
    component: GroupScoring,
    meta: { title: "小组打分", roles: ["super_admin", "admin", "scorer"] },
  },
];
