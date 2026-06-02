const normalizeStringList = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
};

const hasAnyIntersection = (sourceList, targetList) => {
  const source = normalizeStringList(sourceList);
  const target = normalizeStringList(targetList);
  if (!source.length || !target.length) return false;
  return source.some((item) => target.includes(item));
};

const canAccessRouteByRoles = (routeRoles, userRole) => {
  const roles = normalizeStringList(routeRoles);
  if (!roles.length) return true;
  return roles.includes(userRole);
};

const canAccessRouteByPermissions = (routePermissions, userPermissions) => {
  const permissions = normalizeStringList(routePermissions);
  if (!permissions.length) return true;
  const normalizedUserPermissions = normalizeStringList(userPermissions);
  if (!normalizedUserPermissions.length) return true;
  return hasAnyIntersection(permissions, normalizedUserPermissions);
};

export {
  canAccessRouteByPermissions,
  canAccessRouteByRoles,
  hasAnyIntersection,
  normalizeStringList,
};

