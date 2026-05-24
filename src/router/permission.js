import { norm } from "./modules/normalRoutes";
import { admin } from "./modules/adminRoutes";
import { superAdmin } from "./modules/superAdminRoutes";
import { test } from "./modules/testRoutes";
import { mapComponent } from "./routeMap";
import { userApi } from "@/api/user";
import { RouterView } from "vue-router";
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

const ALL_ROLES = ["super_admin", "admin", "scorer", "normal"];
const ADMIN_ROLES = ["super_admin", "admin"];
const SCORE_ROLES = ["super_admin", "admin", "scorer"];
const SUPER_ONLY_ROLES = ["super_admin"];

function resolveRouteRoles(node, normalizedFullPath) {
  const menuCode = String(node?.menuCode || "").toLowerCase();
  const path = String(normalizedFullPath || "").toLowerCase();

  if (menuCode === "home" || path === "/home") return ALL_ROLES;
  if (menuCode.startsWith("super-monitor") || path.startsWith("/admin/monitor")) return SUPER_ONLY_ROLES;
  if (path.startsWith("/scoring")) return SCORE_ROLES;
  if (path.startsWith("/admin")) return ADMIN_ROLES;

  return Array.isArray(node?.roles) && node.roles.length ? node.roles : ADMIN_ROLES;
}

/**
 * Generate accessible routes for a role
 * @param {string} role
 * @returns {Array}
 */
export function generateRoleRoutes(role) {
  // combine arrays; test routes are already controlled by env flag in their module
  const all = [...norm, ...admin, ...superAdmin];
  if (import.meta.env.VITE_SHOW_TEST_ROUTES === 'true') {
    all.push(...test);
  }
  console.log("ALL ROUTES", all)
  console.log("PERM FILTERED", filterRoutesByRole(all, role))
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
  console.log('injected Routes', router.getRoutes())
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
  if (!token) return false;

  try {
    const resp = await userApi.getAuthRoutes();
    // service 返回的是 { code, data, message } 的包装形式（见 request.js）
    const data = resp?.data ?? resp;
    if (!Array.isArray(data) || data.length === 0) return false;

    const normalizeAbsolutePath = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      return raw.startsWith("/") ? raw : `/${raw}`;
    };

    const getRelativePath = (fullPath, parentFullPath) => {
      const normalizedFullPath = normalizeAbsolutePath(fullPath);
      const normalizedParentPath = normalizeAbsolutePath(parentFullPath);
      if (!normalizedParentPath) {
        return normalizedFullPath.replace(/^\//, "");
      }
      if (normalizedFullPath === normalizedParentPath) {
        return normalizedParentPath.replace(/^\//, "");
      }
      const parentPrefix = `${normalizedParentPath}/`;
      if (normalizedFullPath.startsWith(parentPrefix)) {
        return normalizedFullPath.slice(parentPrefix.length);
      }
      return normalizedFullPath.replace(/^\//, "");
    };

    const convertNode = (node, parentFullPath = "") => {
      const fullPath = node.path || node.routePath || node.routeName || node.menuCode || "";
      const normalizedFullPath = normalizeAbsolutePath(fullPath);
      // convert backend absolute path into the relative child path expected by nested vue-router records
      const path = getRelativePath(normalizedFullPath, parentFullPath);
      const name = node.routeName || node.menuCode || path || normalizeRouteName(node);
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const meta = {
        title: node.title || node.menuName || "",
        icon: node.icon || "",
        hidden: !!node.hidden || hasChildren,
        roles: resolveRouteRoles(node, normalizedFullPath),
      };
      const record = { path, name, meta };
      // group nodes use RouterView as a container so children can render under the correct prefix
      if (hasChildren && !node.componentCode) {
        record.component = RouterView;
      } else {
        // map componentCode to local component loader
        const comp = mapComponent(node.componentCode);
        if (comp) record.component = comp;
      }

      if (hasChildren) {
        record.children = node.children.map((c) => convertNode(c, normalizedFullPath));
        if (!node.redirect && record.children.length > 0) {
          record.redirect = { name: record.children[0].name };
        }
      }

      // If a leaf node somehow has no componentCode, fall back to 404 rather than breaking route creation.
      if (!record.component) {
        record.component = mapComponent(node.componentCode) || RouterView;
      }
      return record;
    };

    const records = data.map((n) => convertNode(n));
    injectRoutes(router, records);
    return true;
  } catch {
    // network / parse errors – swallow so app can fallback to local bootstrap
    return false;
  }
}

export default { generateRoleRoutes, injectRoutes, bootstrapRoutesFromStorage };
