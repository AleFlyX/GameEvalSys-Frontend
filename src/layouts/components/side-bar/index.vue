<template>
  <aside class="sidebar-menu" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-head">
      <BrandIcon :is-collapsed="isCollapsed" />
      <button class="collapse-btn" type="button" :aria-label="isCollapsed ? '展开侧边栏' : '收起侧边栏'" @click="toggleSidebar">
        <span class="collapse-chev" :class="{ collapsed: isCollapsed }"></span>
      </button>
    </div>

    <!-- 展开状态的菜单 -->
    <ul v-if="!isCollapsed" class="nav-items">
      <MenuTree :nodes="menuTree" :collapsed="isCollapsed" />

      <MenuItem v-if="userStore.isAdmin" :active="showAgent" label="使用PageAgent" @click="handleAgentShow">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap.ChatSquare" />
          </el-icon>
        </template>
      </MenuItem>
    </ul>

    <!-- 折叠后的菜单 -->
    <ul v-else class="nav-items collapsed-nav">
      <el-tooltip v-for="item in collapsedMenus" :key="item.key" :content="item.label" placement="right" :offset="14"
        :show-after="110" popper-class="sidebar-menu-tooltip">
        <MenuItem :index="item.path" :label="item.label" :active="item.isAgent ? showAgent : null" :collapsed="true"
          :active-paths="item.activePaths" :show-native-title="false" @clicked="handleCollapsedItemClick(item)">
          <template #prefix>
            <el-icon>
              <component :is="elementIconMap[item.icon] || null" />
            </el-icon>
          </template>
        </MenuItem>
      </el-tooltip>
    </ul>
  </aside>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUserStore } from "@/stores/modules/userStore";
import { elementIconMap } from "@/utils/elementIcons";
import BrandIcon from "../../../components/icons/BrandIcon.vue";
import MenuItem from "./components/menuItem.vue";
import MenuTree from "./components/menuTree.vue";

defineOptions({
  name: "SidebarMenu",
});

const userStore = useUserStore();
const normalizePath = (path) => {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
};

const readMenuTree = () => {
  const raw = localStorage.getItem("menuTree");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const menuTree = computed(() => {
  // routesReady 作为依赖，确保在路由准备好后菜单会重新计算。
  void userStore.routesReady;
  return readMenuTree();
});

const flattenMenuTree = (nodes = []) => {
  const list = Array.isArray(nodes) ? nodes : [];
  const results = [];
  const collectActivePaths = (node) => {
    const paths = [];
    const walk = (item) => {
      if (!item) return;
      const path = normalizePath(item.path || "");
      if (path) paths.push(path);
      if (Array.isArray(item.children) && item.children.length) {
        item.children.forEach((child) => walk(child));
      }
    };
    walk(node);
    return paths;
  };
  const walk = (items) => {
    items.forEach((node) => {
      if (!node) return;
      if (node.hidden) return;
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const isLeaf = Boolean(node.componentCode) || !hasChildren;
      if (isLeaf) {
        const path = normalizePath(node.path || "");
        if (!path) return;
        results.push({
          key: node.menuCode || node.routeName || path,
          path,
          label: node.title || node.menuName || node.routeName || node.menuCode || "",
          icon: node.icon || "",
          activePaths: collectActivePaths(node),
        });
        return;
      }
      walk(node.children);
    });
  };
  walk(list);
  return results;
};
const collapsedMenus = computed(() => {
  const menus = flattenMenuTree(menuTree.value);

  if (userStore.isAdmin) {
    menus.push({
      key: "agent-toggle",
      path: "",
      label: "使用PageAgent",
      icon: "ChatSquare",
      isAgent: true,
    });
  }

  return menus;
});

const emits = defineEmits(["showAgent"]);
const showAgent = ref(false);
const handleAgentShow = () => {
  showAgent.value = !showAgent.value;
  emits("showAgent", showAgent.value);
};
const handleCollapsedItemClick = (item) => {
  if (item?.isAgent) {
    handleAgentShow();
  }
};

// 侧边栏折叠状态
const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

</script>

<style scoped>
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 10px 12px;
  background: var(--bg-primary);
  color: var(--text);
  height: 100%;
  width: 258px;
  transition: width 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  box-shadow: var(--card-shadow);
  border-right: 1px solid var(--border);
  /* 为确保滚动体验，x轴不产生多余滚动，且不影响垂直滚动行为 */
  overflow-x: hidden;
  box-sizing: border-box;
}

.sidebar-menu.collapsed {
  width: 84px;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--card-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  border-color: var(--el-color-primary);
  box-shadow: var(--btn-shadow);
  background: var(--card-bg);
}

.collapse-chev {
  width: 7px;
  height: 7px;
  border-right: 2px solid var(--text-secondary);
  border-bottom: 2px solid var(--text-secondary);
  transform: rotate(135deg);
  transition: transform 0.2s ease;
}

.collapse-chev.collapsed {
  transform: rotate(-45deg);
}

.nav-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  /* 保证垂直滚动，auto 或 scroll */
  overflow-x: hidden;
  /* 避免水平滚动条 */
  scrollbar-width: none;
  /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none;
  /* IE/Edge 隐藏 */
}

.collapsed-nav {
  align-items: center;
}

.collapsed-nav :deep(.menu-item) {
  margin-left: auto;
  margin-right: auto;
}
</style>

<style>
.sidebar-menu-tooltip.el-tooltip__popper {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 11px;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  box-shadow: 0 16px 36px rgba(2, 6, 23, 0.24);
  backdrop-filter: blur(8px) saturate(135%);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2px;
  line-height: 1.2;
  padding: 8px 10px;
}

.sidebar-menu-tooltip.el-tooltip__popper .el-popper__arrow::before {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.28);
}
</style>
