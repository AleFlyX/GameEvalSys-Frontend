<template>
  <template v-for="node in normalizedNodes" :key="nodeKey(node)">
    <MenuItem v-if="isLeaf(node)" :index="nodePath(node)" :label="nodeLabel(node)" :level="level > 0 ? 'sub' : 'root'"
      :collapsed="collapsed" :active-paths="collectActivePaths(node)">
      <template #prefix>
        <el-icon>
          <component :is="elementIconMap[nodeIcon(node)] || null" />
        </el-icon>
      </template>
    </MenuItem>

    <MenuFolder v-else :base-index="nodePath(node)" :label="nodeLabel(node)" :active-paths="collectLeafPaths(node)"
      :collapsed="collapsed">
      <template #prefix>
        <el-icon>
          <component :is="elementIconMap[nodeIcon(node)] || null" />
        </el-icon>
      </template>

      <MenuTree :nodes="node.children" :collapsed="collapsed" :level="level + 1" />
    </MenuFolder>
  </template>
</template>

<script setup>
import { computed } from "vue";
import { elementIconMap } from "@/utils/elementIcons";
import MenuItem from "./menuItem.vue";
import MenuFolder from "./menuFolder.vue";

defineOptions({
  name: "MenuTree",
});

const props = defineProps({
  nodes: {
    type: Array,
    default: () => [],
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const normalizePath = (path) => {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
};

const nodeKey = (node) => node?.routeName || node?.menuCode || node?.path || node?.title || "menu-node";
const nodeLabel = (node) => node?.title || node?.menuName || node?.routeName || node?.menuCode || "";
const nodeIcon = (node) => node?.icon || "";
const nodePath = (node) => normalizePath(node?.path || "");

const normalizeNodes = (nodes = []) => {
  const list = Array.isArray(nodes) ? nodes : [];
  return list.flatMap((node) => {
    if (!node) return [];
    if (node.hidden) return [];
    const children = normalizeNodes(node.children || []);
    return [{ ...node, children }];
  });
};

const normalizedNodes = computed(() => normalizeNodes(props.nodes));
const hasRenderableChildren = (node) => Array.isArray(node?.children) && node.children.length > 0;
const isLeaf = (node) => Boolean(node?.componentCode) || !hasRenderableChildren(node);

const collectActivePaths = (node) => {
  const paths = [];
  const walk = (item) => {
    if (!item) return;
    const path = nodePath(item);
    if (path) paths.push(path);
    if (Array.isArray(item.children) && item.children.length) {
      item.children.forEach((child) => walk(child));
    }
  };
  walk(node);
  return paths;
};

const collectLeafPaths = (node) => {
  if (!node?.children || node.children.length === 0) {
    const path = nodePath(node);
    return path ? [path] : [];
  }
  return node.children.flatMap((child) => collectLeafPaths(child));
};
</script>
