// normal页面（打分用户/普通用户，管理员也可访问）
const Home = () => import("@/pages/normal/home/HomePage.vue");
const ScoringList = () => import("@/pages/normal/scoring/ScoringList.vue");
const ProjectScoring = () => import("@/pages/normal/scoring/ProjectScoring.vue");
// const loginTest = () => import("@/pages/public/login/LoginTest.vue")
export const norm = [
  // normal子路由（打分用户/管理员均可访问）
  // {
  //   path: "loginTest",
  //   name: "loginTest",
  //   component: loginTest,
  //   meta: { title: "登陆测试", roles: ["super_admin", "admin", "scorer", "normal"] }, // 可访问角色
  // },
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
    path: "scoring/:projectId", //可通过route.params.projectId读取;
    name: "projectScoring",
    component: ProjectScoring,
    meta: { title: "项目打分", roles: ["super_admin", "admin", "scorer"], hidden: true },
  },
];
