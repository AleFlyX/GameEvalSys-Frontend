const testDialog = () => import('@/test/pages/testDialog.vue')
export const test = [
  {
    path: '/test',
    name: 'test',
    component: testDialog,
    meta: { title: "首页", roles: ["super_admin", "admin", "scorer", "normal"] },
  },
]
