const MENU_TREE_STORAGE_KEY = "menuTree";

function normalizeMenuTree(tree) {
  return Array.isArray(tree) ? tree : [];
}

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

export function writeStoredMenuTree(tree) {
  try {
    localStorage.setItem(MENU_TREE_STORAGE_KEY, JSON.stringify(normalizeMenuTree(tree)));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredMenuTree() {
  localStorage.removeItem(MENU_TREE_STORAGE_KEY);
}

export { MENU_TREE_STORAGE_KEY };
