/**
 * 转义 SQL 值，防止 SQL 注入
 * @param {*} value
 * @returns {string}
 */
const escapeSqlValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  const text = String(value).replace(/'/g, "''");
  return `'${text}'`;
};

/**
 * 构建菜单数据载荷，格式化输入并适配后端预期
 * @param {*} formData
 * @param {*} normalizeMenuType
 * @returns
 */
const buildMenuPayload = (formData = {}, normalizeMenuType) => {
  const menuType = typeof normalizeMenuType === 'function'
    ? normalizeMenuType(formData.menuType)
    : String(formData.menuType || '').trim();

  const payload = {
    parentId: formData.parentId ?? null,
    menuCode: String(formData.menuCode || '').trim(),
    menuType,
    title: String(formData.title || '').trim(),
    path: String(formData.path || '').trim(),
    routeName: String(formData.routeName || '').trim(),
    icon: String(formData.icon || '').trim() || undefined,
    hidden: !!formData.hidden,
    componentCode: String(formData.componentCode || '').trim() || undefined,
    sortNum: Number(formData.sortNum || 0),
    isEnabled: !!formData.isEnabled,
    roleCodes: Array.isArray(formData.roleCodes) ? [...formData.roleCodes] : [],
  };

  if (payload.menuType === 'dir') {
    delete payload.componentCode;
  }

  return payload;
};

/**
 * 构建菜单 SQL 语句
 * @param {*} formData
 * @param {*} normalizeMenuType
 * @returns
 */
const buildMenuSql = (formData = {}, normalizeMenuType) => {
  const payload = buildMenuPayload(formData, normalizeMenuType);
  const roleCodes = Array.isArray(payload.roleCodes) ? payload.roleCodes.filter(Boolean) : [];

  const menuColumns = [
    'parent_id',
    'menu_code',
    'menu_type',
    'title',
    'path',
    'route_name',
    'icon',
    'hidden',
    'component_code',
    'sort_num',
    'is_enabled',
    'is_deleted',
  ];

  const menuValues = [
    payload.parentId ?? 0,
    payload.menuCode,
    payload.menuType,
    payload.title,
    payload.path,
    payload.routeName,
    payload.icon || '',
    payload.hidden ? 1 : 0,
    payload.componentCode || '',
    Number.isFinite(payload.sortNum) ? payload.sortNum : 0,
    payload.isEnabled ? 1 : 0,
    0,
  ].map(escapeSqlValue);

  const menuSql = `INSERT INTO \`sys_menu\` (${menuColumns.map((column) => `\`${column}\``).join(', ')})\nVALUES\n(${menuValues.join(', ')});`;

  const roleMenuSql = roleCodes.length
    ? `INSERT INTO \`sys_role_menu\` (\`role_code\`, \`menu_code\`) \nVALUES\n${roleCodes.map((roleCode) => `(${escapeSqlValue(roleCode)}, ${escapeSqlValue(payload.menuCode)})`).join(',\n')};`
    : '';

  const statements = [
    '-- 自动生成的菜单备份 SQL',
    'START TRANSACTION;',
    menuSql,
    roleMenuSql,
    'COMMIT;',
  ].filter(Boolean);

  return {
    payload,
    menuSql,
    roleMenuSql,
    fullSql: statements.join('\n\n'),
  };
};

/**
 * 从响应中提取 SQL 文本
 * @param {*} response
 * @returns
 */
const extractSqlText = (response) => {
  const data = response?.data ?? {};
  return data.fullSql || data.sql || data.sqlText || data.content || '';
};

/**
 * 从响应中提取 SQL 元数据
 * @param {*} response
 * @returns
 */
const extractSqlMeta = (response) => {
  const data = response?.data ?? {};

  return {
    menuCount: Number(data.menuCount ?? data.total ?? 0),
    generatedAt: data.generatedAt || data.createTime || '',
  };
};

/**
 * 从响应中提取已保存菜单的 SQL 元数据
 * @param {*} response
 * @param {*} payload
 * @returns
 */
const extractSavedMenuSqlMeta = (response, payload = {}) => {
  const data = response?.data ?? {};

  return {
    menuId: data.id ?? payload.id ?? '',
    menuCode: data.menuCode || payload.menuCode || '',
  };
};

export {
  buildMenuPayload,
  buildMenuSql,
  escapeSqlValue,
  extractSavedMenuSqlMeta,
  extractSqlMeta,
  extractSqlText,
};

