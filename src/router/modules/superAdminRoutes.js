const menuManagement = () => import("@/pages/super-admin/menu/index.vue")
const onlineMonitor = () => import("@/pages/super-admin/monitor/online/index.vue")
const serverMonitor = () => import("@/pages/super-admin/monitor/server/index.vue")
export const superAdmin = [
  {
    path: "super-admin/menu",
    name: "superAdminMenuManagement",
    component: menuManagement,
    meta: { title: "菜单管理", roles: ["super_admin"], icon: 'Grid' },
  },
  {
    path: "super-admin/monitor/server",
    name: "superAdminServerMonitor",
    component: serverMonitor,
    meta: { title: "服务器面板", roles: ["super_admin"], icon: 'Coin' },
  },
  {
    path: "super-admin/monitor/online",
    name: "superAdminOnlineMonitor",
    component: onlineMonitor,
    meta: { title: "用户在线管理", roles: ["super_admin"], icon: 'UserFilled' },
  },
]
