const testDialog = () => import('@/test/pages/testDialog.vue')
const testAgent = () => import('@/test/pages/agent.vue')
const loginTest = () => import("@/pages/public/login/test/LoginTest.vue")
export const test = [
  {
    path: 'test',
    name: 'testDialog',
    component: testDialog,
    meta: { title: "首页", roles: ["super_admin", "admin", "scorer", "normal"] },
  },
  {
    path: 'agent',
    name: 'testAgent',
    component: testAgent,
    meta: { title: "agent", roles: ["super_admin", "admin", "scorer", "normal"] },
  },
  {
    path: "login-test",
    name: "loginTest",
    component: loginTest,
    meta: { title: "登陆测试", roles: ["super_admin", "admin", "scorer", "normal"] }, // 可访问角色
  },
]
