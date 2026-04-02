const testDialog = () => import('@/test/pages/testDialog.vue')
const testAgent = () => import('@/test/pages/agent.vue')
const loginTest = () => import("@/pages/public/login/LoginTest.vue")
export const test = [
  {
    path: '/test',
    name: 'test',
    component: testDialog,
    meta: { title: "首页", roles: ["super_admin", "admin", "scorer", "normal"] },
  },
  {
    path: '/agent',
    name: 'AGENT',
    component: testAgent,
    meta: { title: "agent", roles: ["super_admin", "admin", "scorer", "normal"] },
  },
  {
    path: "loginTest",
    name: "loginTest",
    component: loginTest,
    meta: { title: "登陆测试", roles: ["super_admin", "admin", "scorer", "normal"] }, // 可访问角色
  },
]
