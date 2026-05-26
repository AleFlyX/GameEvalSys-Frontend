import { RouterView } from 'vue-router';

/**
 * Normalize a route name to a safe string (alphanumeric, underscore, dash).
 * @param {object|string} route - Route-like object or string used to derive a name.
 * @returns {string} normalized route name
 */
function normalizeRouteName(route) {
  const rawName = route?.name || route?.path || 'dynamic-route';
  return String(rawName).replace(/[^\w-]+/g, '_');
}

const ALL_ROLES = ['super_admin', 'admin', 'scorer', 'normal'];
const ADMIN_ROLES = ['super_admin', 'admin'];
const SCORE_ROLES = ['super_admin', 'admin', 'scorer'];
const SUPER_ONLY_ROLES = ['super_admin'];

/**
 * Resolve a default roles list for a backend node based on menuCode/path heuristics.
 * @param {object} node - backend node
 * @param {string} normalizedFullPath - absolute path like '/admin/foo'
 * @returns {string[]} allowed roles
 */
function resolveRouteRoles(node, normalizedFullPath) {
  const menuCode = String(node?.menuCode || '').toLowerCase();
  const path = String(normalizedFullPath || '').toLowerCase();

  if (menuCode === 'home' || path === '/home') return ALL_ROLES;
  if (menuCode.startsWith('super-monitor') || path.startsWith('/admin/monitor')) return SUPER_ONLY_ROLES;
  if (path.startsWith('/scoring')) return SCORE_ROLES;
  if (path.startsWith('/admin')) return ADMIN_ROLES;

  return Array.isArray(node?.roles) && node.roles.length ? node.roles : ADMIN_ROLES;
}

/**
 * Normalize to an absolute-ish path string. Returns empty string for falsy input.
 * @param {string} value
 * @returns {string}
 */
function normalizeAbsolutePath(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

/**
 * Compute the path segment relative to parentFullPath.
 * @param {string} fullPath
 * @param {string} parentFullPath
 * @returns {string} relative segment (no leading slash)
 */
function getRelativePath(fullPath, parentFullPath) {
  const normalizedFullPath = normalizeAbsolutePath(fullPath);
  const normalizedParentPath = normalizeAbsolutePath(parentFullPath);
  if (!normalizedParentPath) {
    return normalizedFullPath.replace(/^\//, '');
  }
  if (normalizedFullPath === normalizedParentPath) {
    return normalizedParentPath.replace(/^\//, '');
  }
  const parentPrefix = `${normalizedParentPath}/`;
  if (normalizedFullPath.startsWith(parentPrefix)) {
    return normalizedFullPath.slice(parentPrefix.length);
  }
  return normalizedFullPath.replace(/^\//, '');
}

/**
 * Convert a backend node to a vue-router RouteRecord-like object.
 * @param {object} node - backend node
 * @param {string} parentFullPath - parent's normalized full path
 * @param {(code: string) => any} mapComponent - function mapping componentCode -> component
 * @returns {object} route record
 */
function convertNode(node, parentFullPath = '', mapComponent) {
  const fullPath = node.path || node.routePath || node.routeName || node.menuCode || '';
  const normalizedFullPath = normalizeAbsolutePath(fullPath);
  const path = getRelativePath(normalizedFullPath, parentFullPath);
  const name = node.routeName || node.menuCode || path || normalizeRouteName(node);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const meta = {
    title: node.title || node.menuName || '',
    icon: node.icon || '',
    hidden: !!node.hidden || hasChildren,
    roles: resolveRouteRoles(node, normalizedFullPath),
  };

  const record = { path, name, meta };

  if (hasChildren && !node.componentCode) {
    record.component = RouterView;
  } else {
    const comp = typeof mapComponent === 'function' ? mapComponent(node.componentCode) : null;
    if (comp) record.component = comp;
  }

  if (hasChildren) {
    record.children = node.children.map((c) => convertNode(c, normalizedFullPath, mapComponent));
    if (!node.redirect && record.children.length > 0) {
      record.redirect = { name: record.children[0].name };
    }
  }

  if (!record.component) {
    const compFallback = typeof mapComponent === 'function' ? mapComponent(node.componentCode) : null;
    record.component = compFallback || RouterView;
  }

  return record;
}

/**
 * Convert an array of backend nodes to route records.
 * @param {Array} data - backend node array
 * @param {(code: string) => any} mapComponent - optional mapping function for componentCode
 * @returns {Array} route records
 */
export function convertBackendNodes(data = [], mapComponent) {
  if (!Array.isArray(data)) return [];
  if (mapComponent && typeof mapComponent !== 'function') {
    // defensive: if provided but not a function, warn and ignore

    console.warn('convertBackendNodes: mapComponent is not a function, ignoring it.');
    mapComponent = null;
  }
  return data.map((n) => convertNode(n, '', mapComponent));
}

export default { convertBackendNodes };
