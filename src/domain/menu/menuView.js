import { flattenMenus } from './menuTree';

const extractMenuTreeList = (response) => {
  const rawData = response?.data;

  if (Array.isArray(rawData)) {
    return rawData;
  }

  if (Array.isArray(rawData?.list)) {
    return rawData.list;
  }

  return [];
};

const buildMenuStats = (nodes = []) => {
  const stats = { total: 0, enabled: 0, hidden: 0, leaf: 0 };

  const visit = (list = []) => {
    list.forEach((node) => {
      stats.total += 1;
      if (node.isEnabled !== false) stats.enabled += 1;
      if (node.hidden) stats.hidden += 1;

      if (Array.isArray(node.children) && node.children.length > 0) {
        visit(node.children);
        return;
      }

      stats.leaf += 1;
    });
  };

  visit(nodes);
  return stats;
};

const buildMenuDebugInfo = ({
  menuTree = [],
  visibleMenus = [],
  renderedMenus = [],
  blockedParentIds = new Set(),
  expandedMenuIds = new Set(),
} = {}) => {
  const rootSummaryText = (menuTree || [])
    .map((node) => {
      const childCount = Array.isArray(node.children) ? node.children.length : 0;
      return `${node.id}:${node.title || node.menuCode || '-'}(${childCount})`;
    })
    .join(' | ');

  return {
    rootCount: Array.isArray(menuTree) ? menuTree.length : 0,
    visibleCount: flattenMenus(visibleMenus, 0, [], blockedParentIds).length,
    renderedCount: renderedMenus.length,
    expandedCount: expandedMenuIds.size,
    rootSummaryText: rootSummaryText || '-',
  };
};

const buildSaveMenuSqlMetaItems = (saveMenuSqlMeta = {}) => ([
  { label: '菜单ID', value: saveMenuSqlMeta.menuId },
  { label: '菜单编码', value: saveMenuSqlMeta.menuCode },
].filter((item) => item.value !== '' && item.value !== null && item.value !== undefined));

const buildMenuSubmitMessage = ({ isEditing, hasSql } = {}) => {
  if (hasSql) {
    return isEditing ? '菜单已更新，后端已返回标准 SQL' : '菜单已创建，后端已返回标准 SQL';
  }

  return isEditing ? '菜单已更新' : '菜单已创建';
};

const buildDeleteMenuPrompt = (row = {}) => {
  const title = row.title || row.menuCode || '菜单';
  const hasChildren = Array.isArray(row.children) && row.children.length > 0;
  return {
    title: '删除菜单',
    content: hasChildren
      ? `确认删除菜单“${title}”？其子菜单也会一并删除。`
      : `确认删除菜单“${title}”？`,
    hasChildren,
  };
};

const extractMenuTreeResponse = extractMenuTreeList;

export {
  buildDeleteMenuPrompt,
  buildMenuDebugInfo,
  buildMenuStats,
  buildMenuSubmitMessage,
  buildSaveMenuSqlMetaItems,
  extractMenuTreeResponse,
};
