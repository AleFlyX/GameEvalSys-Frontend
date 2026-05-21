import { norm } from "./modules/normalRoutes";
import { admin } from "./modules/adminRoutes";
import { superAdmin } from "./modules/superAdminRoutes";

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
 * Generate accessible routes for a role
 * @param {string} role
 * @returns {Array}
 */
export function generateRoleRoutes(role) {
  // combine arrays; test routes are already controlled by env flag in their module
  const all = [...norm, ...admin, ...superAdmin];
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
      if (!router.hasRoute(rt.name)) {
        // add as child of mainLayout
        router.addRoute("mainLayout", rt);
      }
    } catch (err) {
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
  } catch (err) {
    role = "";
  }

  const routes = generateRoleRoutes(role);
  injectRoutes(router, routes);
}

export default { generateRoleRoutes, injectRoutes, bootstrapRoutesFromStorage };
