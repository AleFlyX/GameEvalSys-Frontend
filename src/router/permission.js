import { norm } from "./modules/normalRoutes";
import { admin } from "./modules/adminRoutes";
import { superAdmin } from "./modules/superAdminRoutes";
import { test } from "./modules/testRoutes";
import { mapComponent } from "./routeMap";
import { userApi } from "@/api/user";
/**
 * Filter a flat list of routes by role
 * @param {Array} routes
 * @param {string} role
 */
function filterRoutesByRole(routes = [], role = "") {
  return routes.filter((r) => {
    const roles = r?.meta?.roles || [];
    if (!roles || roles.length === 0) return true; // no restriction
    return roles.includes(role);
  });
}

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

function normalizeRouteName(route) {
  const rawName = route?.name || route?.path || "dynamic-route";
  return String(rawName).replace(/[^\w-]+/g, "_");
}

/**
 * Generate accessible routes for a role
 * @param {string} role
 * @returns {Array}
 */
export function generateRoleRoutes(role) {
  // combine arrays; test routes are already controlled by env flag in their module
  const all = [...norm, ...admin, ...superAdmin];
  if (import.meta.env.VITE_SHOW_TEST_ROUTES === '1') {
    all.push(...test);
  }
  return filterRoutesByRole(all, role);
}

/**
 * Inject routes into router under the main layout parent
 * @param {Router} router
 * @param {Array} routes
 */
export function injectRoutes(router, routes = []) {
  if (!router || !routes || !routes.length) return;
  routes.forEach((rt) => {
    try {
      const record = cloneRouteRecord(rt);
      if (!record.name) record.name = normalizeRouteName(record);
      if (!router.hasRoute(record.name)) {
        // add as child of mainLayout
        router.addRoute("mainLayout", record);
      }
    } catch {
      // ignore individual add errors
      // console.warn('addRoute failed', rt.name, err)
    }
  });
}

/**
 * Bootstrap dynamic routes from persisted login state before the first navigation.
 * This makes hard refreshes on /home and other protected pages resolve correctly.
 * @param {Router} router
 */
export function bootstrapRoutesFromStorage(router) {
  if (!router) return;
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  if (!token) return;

  let role = "";
  try {
    const rawUserInfo = localStorage.getItem("userInfo");
    const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;
    role = userInfo?.role || "";
  } catch {
    role = "";
  }

  const routes = generateRoleRoutes(role);
  injectRoutes(router, routes);
}

/**
 * Fetch routes tree from backend and inject into router.
 * Backend should return an array of nodes with fields:
 * { menuCode, path, routeName, title, icon, hidden, componentCode, children }
 */
export async function fetchAndInjectBackendRoutes(router) {
  if (!router) return;
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  if (!token) return;

  try {
    const resp = await userApi.getAuthRoutes();
    // service 返回的是 { code, data, message } 的包装形式（见 request.js）
    const data = resp?.data ?? resp;
    if (!Array.isArray(data)) return;

    let role = "";
    try {
      const rawUserInfo = localStorage.getItem("userInfo");
      const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;
      role = userInfo?.role || "";
    } catch {
      role = "";
    }

    const convertNode = (node) => {
      const fullPath = node.path || node.routePath || node.routeName || node.menuCode || "";
      // strip leading slash so it becomes a child path under mainLayout
      const path = String(fullPath).replace(/^\//, "");
      const name = node.routeName || node.menuCode || path || normalizeRouteName(node);
      const meta = {
        title: node.title || node.menuName || "",
        icon: node.icon || "",
        hidden: !!node.hidden,
        roles: node.roles && node.roles.length ? node.roles : role ? [role] : [],
      };
      const record = { path, name, meta };
      // map componentCode to local component loader
      const comp = mapComponent(node.componentCode);
      if (comp) record.component = comp;
      if (Array.isArray(node.children) && node.children.length) {
        record.children = node.children.map((c) => convertNode(c));
      }
      return record;
    };

    const records = data.map((n) => convertNode(n));
    injectRoutes(router, records);
  } catch {
    // network / parse errors – swallow so app can fallback to local bootstrap
    return;
  }
}

export default { generateRoleRoutes, injectRoutes, bootstrapRoutesFromStorage };
