import { ref } from "vue";
import { clearStoredMenuTree, readStoredMenuTree, writeStoredMenuTree } from "@/domain/dynamicRouteMenu";

const menuTree = ref(readStoredMenuTree());
const routesReady = ref(false);

function normalizeMenuTree(tree) {
  return Array.isArray(tree) ? tree : [];
}

export function hydrateDynamicMenuTree() {
  menuTree.value = readStoredMenuTree();
  return menuTree.value;
}

export function setDynamicMenuTree(tree) {
  const normalized = normalizeMenuTree(tree);
  menuTree.value = normalized;
  writeStoredMenuTree(normalized);
  return menuTree.value;
}

export function clearDynamicMenuTree() {
  menuTree.value = [];
  clearStoredMenuTree();
  return menuTree.value;
}

export function setDynamicRoutesReady(value) {
  routesReady.value = !!value;
  return routesReady.value;
}

export function resetDynamicRouteState() {
  menuTree.value = [];
  routesReady.value = false;
  clearStoredMenuTree();
}

export { menuTree, routesReady };
