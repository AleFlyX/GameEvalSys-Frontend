// 本地的 componentCode -> 组件 映射表
// 后端返回的 componentCode 应当映射到这里的条目
// 未命中的 componentCode 会返回 404 页面作为兜底，避免运行时报错
const NotFound = () => import('@/pages/public/404/NotFound.vue');

export const routeMap = {
  // 示例映射：后端应使用这些 componentCode 与前端约定
  'normal-home': () => import('@/pages/normal/home/HomePage.vue'),
  'admin-project-list': () => import('@/pages/admin/project/list/index.vue'),
  // 扩展映射
  'normal-scoring-list': () => import('@/pages/normal/scoring/list/index.vue'),
  'normal-scoring-groups': () => import('@/pages/normal/scoring/groups/index.vue'),
  'admin-project-edit': () => import('@/pages/admin/project/edit/index.vue'),
  'admin-project-group': () => import('@/pages/admin/project-group/index.vue'),
  'admin-reviewer-group': () => import('@/pages/admin/reviewer-group/ReviewerGroupList.vue'),
  'admin-user': () => import('@/pages/admin/user/index.vue'),
  'admin-statistic': () => import('@/pages/admin/statistic/StatisticPannel.vue'),
  'public-login': () => import('@/pages/public/login/LoginPage.vue'),
  'public-notfound': () => import('@/pages/public/404/NotFound.vue'),
  'super-monitor-server': () => import('@/pages/super-admin/monitor/server/index.vue'),
};

export function mapComponent(componentCode) {
  const loader = componentCode ? routeMap[componentCode] : null;
  return loader || NotFound;
}

export default { routeMap, mapComponent };
