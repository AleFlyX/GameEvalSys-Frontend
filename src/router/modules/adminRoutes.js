// admin页面（仅超级管理员/管理员）
const UserList = () => import("@/pages/admin/user/UserList.vue");
// const UserAdd = () => import("@/pages/admin/user/UserAdd.vue");
// const UserEdit = () => import("@/pages/admin/user/UserEdit.vue");
const ProjectList = () => import("@/pages/admin/project/ProjectList.vue");
// const ProjectAdd = () => import("@/pages/admin/project/ProjectAdd.vue");
// const ProjectEdit = () => import("@/pages/admin/project/ProjectEdit.vue");
const Statistic = () => import("@/pages/admin/statistic/StatisticPannel.vue");
export const admin = [
  {
    path: "user",
    name: "userList",
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
    path: "project",
    name: "projectList",
    component: ProjectList,
    meta: { title: "项目管理", roles: ["super_admin", "admin"] },
  },
  // {
  //   path: "project/add",
  //   name: "projectAdd",
  //   component: ProjectAdd,
  //   meta: { title: "新增项目", roles: ["super_admin", "admin"] },
  // },
  // {
  //   path: "project/edit/:id",
  //   name: "projectEdit",
  //   component: ProjectEdit,
  //   meta: { title: "编辑项目", roles: ["super_admin", "admin"] },
  // },
  {
    path: "statistic",
    // path: "statistic/:projectId",
    name: "statistic",
    component: Statistic,
    meta: { title: "打分统计", roles: ["super_admin", "admin"] },
  },
];
