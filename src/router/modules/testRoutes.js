const testDialog = () => import('@/test/pages/testDialog.vue')
const testAgent = () => import('@/test/pages/agent.vue')
export const test = [
  {
    path: '/test',
    name: 'test',
    component: testDialog,
    meta: { title: "首页", roles: ["super_admin", "admin", "scorer", "normal"] },
  },
  // {
  //   path: '/agent',
  //   name: 'AGENT',
  //   component: testAgent,
  //   meta: { title: "agent", roles: ["super_admin", "admin", "scorer", "normal"] },
  // },
]
