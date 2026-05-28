const testDialog = () => import('@/test/pages/testDialog.vue')
const testAgent = () => import('@/test/pages/agent.vue')
const loginTest = () => import("@/test/pages/LoginTest.vue")
export const test = [
  {
    path: 'test',
    name: 'testDialog',
    component: testDialog,
    meta: { title: "首页", roles: ["super_admin", "admin"], test: true },
  },
  {
    path: 'agent',
    name: 'testAgent',
    component: testAgent,
    meta: { title: "agent", roles: ["super_admin", "admin"], test: true },
  },
  {
    path: "login-test",
    name: "loginTest",
    component: loginTest,
    meta: { title: "登陆测试", roles: ["super_admin", "admin"], test: true }, // 可访问角色
  },
  {
    path: "uppload-file",
    name: "uploadFile",
    component: () => import("@/test/pages/uploadFile.vue"),
    meta: { title: "文件上传测试", roles: ["super_admin", "admin"], test: true }
  }
]
