// admin页面（仅超级管理员/管理员）
const UserList = () => import("@/pages/admin/user/UserList.vue");
const ProjectList = () => import("@/pages/admin/project/ProjectList.vue");
const ProjectEdit = () => import("@/pages/admin/project/ProjectEdit.vue");
const reviewerGroups = () => import("@/pages/admin/reviewer-group/ReviewerGroupList.vue")
const projectGroupsList = () => import("@/pages/admin/project-group/ProjectGroupList.vue")
const scoringStds = () => import("@/pages/admin/scoring-std/ScoringStandardsList.vue")
const Statistic = () => import("@/pages/admin/statistic/StatisticPannel.vue");

export const admin = [
  {
    path: "reviewerGroups",
    name: "评审队伍(班级)",
    component: reviewerGroups,
    meta: { title: "评审队伍管理", roles: ["super_admin", "admin"] },
  },
  {
    path: "user",
    name: "用户管理",
    component: UserList,
    meta: { title: "用户管理", roles: ["super_admin", "admin"] },
  },
  // {
  //   path: "user/add",
  //   name: "userAdd",
  //   component: UserAdd,
  //   meta: { title: "新增用户", roles: ["super_admin", "admin"] },
  // },
  // {
  //   path: "user/edit/:id",
  //   name: "userEdit",
  //   component: UserEdit,
  //   meta: { title: "编辑用户", roles: ["super_admin", "admin"] },
  // },
  {
    path: "scoringStds",
    name: "打分标准",
    component: scoringStds,
    meta: { title: "打分标准", roles: ["super_admin", "admin"] },
  },
  {
    path: "projectGroups",
    name: "受审队伍",
    component: projectGroupsList,
    meta: { title: "项目受审队伍管理", roles: ["super_admin", "admin"] },
  },
  {
    path: "project",
    name: "项目管理",
    component: ProjectList,
    meta: { title: "项目管理", roles: ["super_admin", "admin"] },
  },

  // {
  //   path: "project/add",
  //   name: "projectAdd",
  //   component: ProjectAdd,
  //   meta: { title: "新增项目", roles: ["super_admin", "admin"] },
  // },
  {
    path: "project/edit/:id",
    name: "projectEdit",
    component: ProjectEdit,
    meta: { title: "编辑项目", roles: ["super_admin", "admin"], hidden: true },
  },
  {
    path: "statistic",
    // path: "statistic/:projectId",
    name: "得分统计",
    component: Statistic,
    meta: { title: "打分统计", roles: ["super_admin", "admin"] },
  },
];
