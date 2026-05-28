import { mapComponent } from "./routeMap";
import { userApi } from "@/api/user";
import { setDynamicMenuTree } from "@/domain/dynamicRoutes/dynamicRouteState";
import { convertBackendNodes } from "@/domain/dynamicRoutes/dynamicRouteConverter";

/**
 * 克隆路由，防止对路由的操作会影响到收到的数据源
 * @param {*} route
 * @returns
 */
function cloneRouteRecord(route) {
  const cloned = { ...route };
  if (Array.isArray(route?.children) && route.children.length) {
    cloned.children = route.children.map((child) => cloneRouteRecord(child));
  }
  return cloned;
}

/**
 * 规范化路径，确保以单斜杠开头且没有尾斜杠
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  return raw.startsWith('/') ? raw.replace(/\/+$/, '') : `/${raw.replace(/\/+$/, '')}`;
}

/**
 * 拼接路由路径
 * @param {*} parentPath
 * @param {*} childPath
 * @returns
 */
function joinRoutePath(parentPath, childPath) {
  const parent = normalizePath(parentPath);
  const child = String(childPath || '').trim();
  if (!child) return parent;
  if (child.startsWith('/')) return normalizePath(child);
  if (!parent) return normalizePath(child);
  return normalizePath(`${parent}/${child}`);
}

/**
 * 路由查重，判断目标路由是否已存在于 router 中
 * @param {*} router
 * @returns
 */
function collectExistingRoutePaths(router) {
  return new Set((router?.getRoutes?.() || []).map((route) => normalizePath(route.path)));
}

/**
 * 检查路径是否包含必需的参数
 * @param {*} path
 * @returns
 */
function hasRequiredParam(path) {
  return /(^|\/):[^/]+/.test(String(path || ''));
}

/**
 * 判断目标路由是否匹配不到（即落在 404 上）
 * @param {*} parentPath
 * @param {*} childPath
 * @returns
 */
function canRedirectToChild(parentPath, childPath) {
  const fullChildPath = joinRoutePath(parentPath, childPath);
  return Boolean(fullChildPath) && !hasRequiredParam(fullChildPath);
}

/**
 * 如果路由缺失且当前落在 404 上，则注入动态路由后重入以触发正确匹配
 * @param {*} router
 * @param {*} record
 * @param {*} parentName
 * @param {*} parentPath
 * @param {*} existingPaths
 * @returns
 */
function addRouteIfMissing(router, record, parentName, parentPath, existingPaths) {
  if (!router || !record) return;

  const currentFullPath = joinRoutePath(parentPath, record.path);
  if (currentFullPath && existingPaths.has(currentFullPath)) {
    // 如果已存在相同路径，只有当该已存在路由是静态兜底（staticFallback）时，才允许被后端路由覆盖
    const existingRoute = (router.getRoutes() || []).find((r) => normalizePath(r.path) === currentFullPath);
    if (existingRoute && existingRoute.meta && existingRoute.meta.staticFallback) {
      try {
        router.removeRoute(existingRoute.name);
      } catch {
        // ignore
      }
      existingPaths.delete(currentFullPath);
    } else {
      return;
    }
  }

  const cloned = cloneRouteRecord(record);
  if (!cloned.name) cloned.name = normalizeRouteName(cloned);

  if (Array.isArray(cloned.children) && cloned.children.length) {
    cloned.children = cloned.children.filter((child) => {
      const childFullPath = joinRoutePath(currentFullPath, child.path);
      return !(childFullPath && existingPaths.has(childFullPath));
    });

    if (cloned.redirect && cloned.children.length > 0) {
      const firstChild = cloned.children[0];
      if (!canRedirectToChild(currentFullPath, firstChild.path)) {
        delete cloned.redirect;
      }
    }
  }

  if (!router.hasRoute(cloned.name)) {
    router.addRoute(parentName, cloned);
    existingPaths.add(currentFullPath);
  } else {
    // 若已存在同名路由，但该路由是静态兜底，则移除后由后端路由覆盖
    const existingByName = (router.getRoutes() || []).find((r) => r.name === cloned.name);
    if (existingByName && existingByName.meta && existingByName.meta.staticFallback) {
      try {
        router.removeRoute(cloned.name);
      } catch {
        // ignore
      }
      router.addRoute(parentName, cloned);
      existingPaths.add(currentFullPath);
    }
  }
}

/**
 * 格式化路由名称，确保每个路由都有一个有效的 name 字段，供 addRoute 使用
 * @param {*} route
 * @returns
 */
function normalizeRouteName(route) {
  const rawName = route?.name || route?.path || "dynamic-route";
  return String(rawName).replace(/[^\w-]+/g, "_");
}

/**
 * 生成角色对应的路由列表
 * - 根据角色过滤不同权限的路由
 * - testRoutes 由环境变量控制是否包含在内，且其内部也有基于环境变量的控制
 * @param {string} role
 * @returns {Array}
 */
// NOTE: Business routes are exclusively provided by the backend. Frontend only
// keeps `publicRoutes` and `routeMap` as component loaders. The legacy
// generateRoleRoutes logic that merged local static routes has been removed to
// avoid dual-sources-of-truth and 404-on-refresh issues.

/**
 * 注入路由到 router 中的mainLayout下，避免重复注入同一路由
 * - 已存在的路由会被跳过
 * - 通过递归处理嵌套路由
 * - 注入时会规范化路径和名称以确保一致性
 * - 注入完成后会打印当前 router 中的所有路由以供调试验证
 * @param {Router} router
 * @param {Array} routes
 */
export function injectRoutes(router, routes = []) {
  if (!router || !routes || !routes.length) return;
  const existingPaths = collectExistingRoutePaths(router);
  routes.forEach((rt) => {
    try {
      addRouteIfMissing(router, rt, "mainLayout", "", existingPaths);
    } catch {
      // 注入失败通常是因为路由配置有误（如缺失 path 或 name）
      console.warn("Failed to inject route", rt);
    }
  });
  console.log('injected Routes', router.getRoutes())
}

/**
 * 初始化动态路由：
 * - 若用户已登录且 routesReady 为 false，则优先从后端拉取并注入动态路由，失败回退到本地持久化路由
 * - 若没有 token 则直接标记动态路由准备就绪（虽然实际上没有动态路由可注入）
 * @param {*} router
 * @returns {Promise<boolean>} 成功注入返回 true，失败返回 false
 * @param {Router} router
 */
export function bootstrapRoutesFromStorage(router) {
  if (!router) return;
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  if (!token) return;

  // 从本地持久化的菜单树恢复（如果有），并按后端格式转换后注入路由
  try {
    const raw = localStorage.getItem("menuTree");
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0) {
      const records = convertBackendNodes(parsed, mapComponent);
      injectRoutes(router, records);
    }
  } catch (e) {
    // ignore malformed stored menu
    console.warn("bootstrapRoutesFromStorage: failed to read stored menu", e);
  }
}

/**
 * 丛后端获取路由树并注入到 router 中
 * 后端返回的路由数据结构示例:
 * { menuCode, path, routeName, title, icon, hidden, componentCode, children }
 * @param {*} router
 * @returns {Promise<boolean>} 成功注入返回 true，失败返回 false
 */
export async function fetchAndInjectBackendRoutes(router) {
  if (!router) return;
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  if (!token) return false;

  try {
    const resp = await userApi.getAuthRoutes();
    // service 返回的是 { code, data, message } 的包装形式（见 request.js）
    const data = resp?.data ?? resp;
    if (!Array.isArray(data) || data.length === 0) return false;

    // 持久化存储菜单树以供侧边栏使用
    setDynamicMenuTree(data);

    const records = convertBackendNodes(data, mapComponent);
    injectRoutes(router, records);
    return true;
  } catch {
    // 拉取或注入失败，返回 false 以触发后续的回退逻辑
    return false;
  }
}

export default { injectRoutes, bootstrapRoutesFromStorage };
