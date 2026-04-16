const onlineMonitor = () => import("@/pages/super-admin/monitor/online/index.vue")

export const superAdmin = [
  {
    path: "super-admin/monitor/server",
    name: "superAdminServerMonitor",
    component: onlineMonitor,
    meta: { title: "服务器面板", roles: ["super_admin"], icon: 'Coin' },
  },
  {
    path: "super-admin/monitor/online",
    name: "superAdminOnlineMonitor",
    component: onlineMonitor,
    meta: { title: "用户在线管理", roles: ["super_admin"], icon: 'UserFilled' },
  },
]
