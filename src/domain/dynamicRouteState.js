import { ref } from "vue";
import { clearStoredMenuTree, readStoredMenuTree, writeStoredMenuTree } from "@/domain/dynamicRouteMenu";

const menuTree = ref(readStoredMenuTree());
const routesReady = ref(false);

/**
 * 将后端返回的菜单树规范化为数组形式，确保即使后端返回 null/undefined/非数组也能正常处理
 * @param {*} tree
 * @returns {Array}
 */
function normalizeMenuTree(tree) {
  return Array.isArray(tree) ? tree : [];
}

/**
 * 水合动态菜单树
 * @returns
 */
export function hydrateDynamicMenuTree() {
  menuTree.value = readStoredMenuTree();
  return menuTree.value;
}

/**
 * 设置动态菜单树
 * @param {*} tree
 * @returns {Array}
 */
export function setDynamicMenuTree(tree) {
  const normalized = normalizeMenuTree(tree);
  menuTree.value = normalized;
  writeStoredMenuTree(normalized);
  return menuTree.value;
}

/**
 * 清除动态菜单树（同时清除 localStorage 中的持久化数据）
 * @returns
 */
export function clearDynamicMenuTree() {
  menuTree.value = [];
  clearStoredMenuTree();
  return menuTree.value;
}

/**
 * 设置动态路由准备就绪状态
 * @param {*} value
 * @returns
 */
export function setDynamicRoutesReady(value) {
  routesReady.value = !!value;
  return routesReady.value;
}

/**
 * 重置动态路由状态（清空菜单树、重置准备就绪状态，并清除 localStorage 中的持久化数据）
 */
export function resetDynamicRouteState() {
  menuTree.value = [];
  routesReady.value = false;
  clearStoredMenuTree();
}

export { menuTree, routesReady };
