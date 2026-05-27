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

function isAbsoluteLikePath(rawPath) {
  const path = String(rawPath || '').trim();
  if (!path) return false;
  if (path.startsWith('/')) return true;
  const firstSegment = path.split('/')[0];
  return ['admin', 'super-admin', 'scoring', 'home'].includes(firstSegment);
}

function buildFullPath(rawPath, parentFullPath) {
  const raw = String(rawPath || '').trim();
  if (!raw) return normalizeAbsolutePath(parentFullPath || '');
  if (raw.startsWith('/') || isAbsoluteLikePath(raw)) return normalizeAbsolutePath(raw);
  if (!parentFullPath) return normalizeAbsolutePath(raw);
  return normalizeAbsolutePath(`${normalizeAbsolutePath(parentFullPath)}/${raw}`);
}

function toChildPath(fullPath) {
  return String(fullPath || '').replace(/^\//, '');
}

function shouldRenderRoute(node) {
  if (node?.componentCode) return true;
  const hasChildren = Array.isArray(node?.children) && node.children.length > 0;
  return !hasChildren;
}

/**
 * Convert a backend node to a vue-router RouteRecord-like object.
 * @param {object} node - backend node
 * @param {string} fullPath - absolute full path for this node
 * @param {(code: string) => any} mapComponent - function mapping componentCode -> component
 * @returns {object|null} route record
 */
function convertNode(node, fullPath, mapComponent) {
  if (!shouldRenderRoute(node)) return null;

  const path = toChildPath(fullPath);
  const name = node.routeName || node.menuCode || path || normalizeRouteName(node);
  const meta = {
    title: node.title || node.menuName || '',
    icon: node.icon || '',
    hidden: !!node.hidden,
    roles: resolveRouteRoles(node, fullPath),
  };

  const record = { path, name, meta };
  const comp = typeof mapComponent === 'function' ? mapComponent(node.componentCode) : null;
  if (comp) {
    record.component = comp;
  } else if (node.componentCode) {
    record.component = RouterView;
  }

  return record;
}

function flattenBackendNodes(nodes, parentFullPath, mapComponent, out) {
  const list = Array.isArray(nodes) ? nodes : [];
  list.forEach((node) => {
    if (!node) return;
    const fullPath = buildFullPath(node.path || node.routePath || node.routeName || node.menuCode || '', parentFullPath);
    const record = convertNode(node, fullPath, mapComponent);
    if (record) out.push(record);
    if (Array.isArray(node.children) && node.children.length > 0) {
      flattenBackendNodes(node.children, fullPath, mapComponent, out);
    }
  });
}

/**
 * 扁平来自后端的路由节点数据为 vue-router RouteRecord 数组
 * - 对于没有 componentCode 的节点，如果它是一个分组（有 children），则不渲染路由（即不生成 RouteRecord），但会继续处理其子节点
 * - 对于没有 componentCode 的叶子节点，则使用 RouterView 作为组件的 fallback，以确保路由可访问但不渲染内容
 * - 对于有 componentCode 但 mapComponent 无法解析的节点，也使用 RouterView 作为 fallback，并在控制台警告
 * @param {Array} data - 后端节点数组
 * @param {(code: string) => any} mapComponent - 可选的 componentCode 映射函数
 * @returns {Array} RouteRecord 数组
 */
export function convertBackendNodes(data = [], mapComponent) {
  if (!Array.isArray(data)) return [];
  if (mapComponent && typeof mapComponent !== 'function') {
    // defensive: if provided but not a function, warn and ignore

    console.warn('convertBackendNodes: mapComponent is not a function, ignoring it.');
    mapComponent = null;
  }
  const records = [];
  flattenBackendNodes(data, '', mapComponent, records);
  return records;
}

export default { convertBackendNodes };
