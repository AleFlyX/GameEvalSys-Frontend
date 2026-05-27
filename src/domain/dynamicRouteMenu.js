const MENU_TREE_STORAGE_KEY = "menuTree";

function normalizeMenuTree(tree) {
  return Array.isArray(tree) ? tree : [];
}

/**
 * 从 localStorage 中读取菜单树，确保即使存储的值无效也能返回一个空数组
 * @return {Array} 菜单树数组
 */
export function readStoredMenuTree() {
  const raw = localStorage.getItem(MENU_TREE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return normalizeMenuTree(parsed);
  } catch {
    return [];
  }
}

/**
 * 将菜单树写入 localStorage
 * @param {Array} tree 菜单树数组
 * @return {boolean} 写入是否成功
 */
export function writeStoredMenuTree(tree) {
  try {
    localStorage.setItem(MENU_TREE_STORAGE_KEY, JSON.stringify(normalizeMenuTree(tree)));
    return true;
  } catch {
    return false;
  }
}

/**
 * 从 localStorage 中清除菜单树数据
 * @return {boolean} 清除是否成功
 */
export function clearStoredMenuTree() {
  localStorage.removeItem(MENU_TREE_STORAGE_KEY);
  return true;
}

export { MENU_TREE_STORAGE_KEY };
