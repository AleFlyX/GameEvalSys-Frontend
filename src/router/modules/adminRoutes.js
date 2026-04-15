// admin页面（仅超级管理员/管理员）
const UserList = () => import("@/pages/admin/user/index.vue");
const ProjectList = () => import("@/pages/admin/project/list/index.vue");
const ProjectEdit = () => import("@/pages/admin/project/edit/index.vue");
const ProjectStatisticList = () => import("@/pages/admin/project/statistic/index.vue");
const ProjectStatisticDetail = () => import("@/pages/admin/project/statistic/detail/index.vue");
const reviewerGroups = () => import("@/pages/admin/reviewer-group/ReviewerGroupList.vue")
const projectGroupsList = () => import("@/pages/admin/project-group/index.vue")
const scoringStds = () => import("@/pages/admin/scoring-std/index.vue")
const Statistic = () => import("@/pages/admin/statistic/StatisticPannel.vue");

export const admin = [
  {
    path: "admin/statistic",
    // path: "statistic/:projectId",
    name: "平台数据",
    component: Statistic,
    meta: { title: "平台统计", roles: ["super_admin", "admin"], icon: 'Monitor' },
  },
  {
    path: "admin/reviewerGroups",
    name: "评审队伍(班级)",
    component: reviewerGroups,
    meta: { title: "评审队伍管理", roles: ["super_admin", "admin"], icon: 'OfficeBuilding' },
  },
  {
    path: "admin/user",
    name: "用户管理",
    component: UserList,
    meta: { title: "用户管理", roles: ["super_admin", "admin"], icon: 'Avatar' },
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
    path: "admin/scoringStds",
    name: "打分标准",
    component: scoringStds,
    meta: { title: "打分标准", roles: ["super_admin", "admin"], icon: 'Checked' },
  },
  {
    path: "admin/projectGroups",
    name: "受审队伍",
    component: projectGroupsList,
    meta: { title: "项目受审队伍管理", roles: ["super_admin", "admin"], icon: 'User' },
  },
  {
    path: "admin/project",
    name: "项目管理",
    component: ProjectList,
    meta: { title: "项目管理", roles: ["super_admin", "admin"], icon: 'Management' },
  },

  // {
  //   path: "project/add",
  //   name: "projectAdd",
  //   component: ProjectAdd,
  //   meta: { title: "新增项目", roles: ["super_admin", "admin"] },
  // },
  {
    path: "admin/project/edit/:id",
    name: "projectEdit",
    component: ProjectEdit,
    meta: { title: "编辑项目", roles: ["super_admin", "admin"], hidden: true },
  },
  {
    path: "admin/project/statistic",
    name: "projectStatisticList",
    component: ProjectStatisticList,
    meta: { title: "项目打分统计", roles: ["super_admin", "admin"], icon: 'DataAnalysis' },
  },
  {
    path: "admin/project/statistic/:projectId",
    name: "projectStatisticDetail",
    component: ProjectStatisticDetail,
    meta: { title: "打分统计详情", roles: ["super_admin", "admin"], hidden: true },
  },
];
