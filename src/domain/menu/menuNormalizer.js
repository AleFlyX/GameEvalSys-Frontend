/**
 * 规范化菜单类型
 * @param {*} value
 * @returns
 */
const normalizeMenuType = (value) => {
  const normalizedValue = String(value || '').trim();
  if (normalizedValue === 'catalog') return 'dir'; // 兼容后端旧逻辑
  if (normalizedValue === 'dir' || normalizedValue === 'menu' || normalizedValue === 'button') {
    return normalizedValue;
  }
  return 'menu';
};

const normalizeBool = (value) => value === true || value === 1 || value === '1';

/**
 * 规范化角色编码列表，支持数组和逗号分隔字符串两种输入格式
 * @param {*} value
 * @returns
 */
const normalizeRoleCodes = (value) => {
  const normalizedValues = [];

  if (Array.isArray(value)) {
    value.forEach((item) => {
      const normalizedItem = String(item).trim();
      if (normalizedItem && !normalizedValues.includes(normalizedItem)) {
        normalizedValues.push(normalizedItem);
      }
    });
    return normalizedValues;
  }

  if (typeof value === 'string') {
    value.split(',').forEach((item) => {
      const normalizedItem = item.trim();
      if (normalizedItem && !normalizedValues.includes(normalizedItem)) {
        normalizedValues.push(normalizedItem);
      }
    });
    return normalizedValues;
  }

  return [];
};

/**
 * 规范化菜单节点
 * @param {*} node
 * @returns
 */
const normalizeMenuNode = (node) => ({
  ...node,
  hidden: normalizeBool(node?.hidden),
  isEnabled: node?.isEnabled === undefined ? true : normalizeBool(node?.isEnabled),
  menuType: normalizeMenuType(node?.menuType),
  roleCodes: normalizeRoleCodes(node?.roleCodes),
  children: Array.isArray(node?.children) ? node.children.map((child) => normalizeMenuNode(child)) : [],
});

const cloneMenuTree = (nodes = []) => nodes.map((node) => normalizeMenuNode(node));

/**
 * 规范化菜单记录，适用于从后端获取的菜单数据，确保字段类型和默认值的一致性
 * @param {*} record
 * @returns
 */
const normalizeMenuRecord = (record) => ({
  ...record,
  parentId: record?.parentId ?? null,
  menuCode: record?.menuCode || '',
  menuType: normalizeMenuType(record?.menuType),
  title: record?.title || '',
  path: record?.path || '',
  routeName: record?.routeName || '',
  icon: record?.icon || '',
  hidden: normalizeBool(record?.hidden),
  componentCode: record?.componentCode || '',
  sortNum: Number(record?.sortNum || 0),
  isEnabled: record?.isEnabled === undefined ? true : normalizeBool(record?.isEnabled),
  roleCodes: normalizeRoleCodes(record?.roleCodes),
});

export {
  cloneMenuTree,
  normalizeBool,
  normalizeMenuNode,
  normalizeMenuRecord,
  normalizeMenuType,
  normalizeRoleCodes,
};
