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
      <MenuItem v-for="item in visibleNormMenus" :key="item.path" :index="item.path"
        :label="item.meta?.title || item.name">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap[item.meta.icon] || null" />
          </el-icon>
        </template>
      </MenuItem>

      <!-- 数据统计和管理面板都在 /admin 下，但它们只应该响应各自的路由集合。 -->
      <MenuFolder v-if="userStore.isAdmin" base-index="/admin" label="数据统计" :active-paths="statisticActivePaths"
        :collapsed="isCollapsed">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap.Histogram" />
          </el-icon>
        </template>

        <MenuItem v-for="item in visibleStatisticMenus" :key="item.path" :index="item.path"
          :label="item.meta?.title || item.name" level="sub">
          <template #prefix>
            <el-icon>
              <component :is="elementIconMap[item.meta.icon] || null" />
            </el-icon>
          </template>
        </MenuItem>
      </MenuFolder>

      <!-- 管理面板使用同一前缀，但通过 excludePaths 排除统计页，避免误展开。 -->
      <MenuFolder v-if="userStore.isAdmin" base-index="/admin" label="管理面板" :active-paths="adminActivePaths"
        :exclude-paths="statisticActivePaths" :collapsed="isCollapsed">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap.Setting" />
          </el-icon>
        </template>

        <MenuItem v-for="item in visibleAdminMenus" :key="item.path" :index="item.path"
          :label="item.meta?.title || item.name" level="sub">
          <template #prefix>
            <el-icon>
              <component :is="elementIconMap[item.meta.icon] || null" />
            </el-icon>
          </template>
        </MenuItem>
      </MenuFolder>

      <!-- 后台管理单独使用 /super-admin 前缀，按自身路由集合展开。 -->
      <MenuFolder v-if="userStore.isSuperAdmin" base-index="/super-admin" label="后台管理"
        :active-paths="superAdminActivePaths" :collapsed="isCollapsed">
        <template #prefix>
          <el-icon>
            <component :is="elementIconMap.Grid" />
          </el-icon>
        </template>

        <MenuItem v-for="item in visibleSuperAdminMenus" :key="item.path" :index="item.path"
          :label="item.meta?.title || item.name" level="sub">
          <template #prefix>
            <el-icon>
              <component :is="elementIconMap[item.meta.icon] || null" />
            </el-icon>
          </template>
        </MenuItem>
      </MenuFolder>

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
          :show-native-title="false" @clicked="handleCollapsedItemClick(item)">
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
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/modules/userStore";
import { elementIconMap } from "@/utils/elementIcons";
import BrandIcon from "../../../components/icons/BrandIcon.vue";
import MenuItem from "./components/menuItem.vue";
import MenuFolder from "./components/menuFolder.vue";

defineOptions({
  name: "SidebarMenu",
});

const userStore = useUserStore();
const router = useRouter();
const isMenuRouteVisible = (route) => Boolean(route.meta?.title && !route.meta?.hidden && route.meta?.roles?.includes(userStore.userRole));
const isStatisticRoute = (route) => route.path.includes("/statistic");
const toMenuItem = (route, keyPrefix) => ({
  key: `${keyPrefix}-${route.path}`,
  path: route.path,
  label: route.meta?.title || route.name,
  icon: route.meta?.icon,
});

const visibleRoutes = computed(() => {
  // routesReady 作为依赖，确保在路由准备好后菜单会重新计算。
  void userStore.routesReady;
  return router.getRoutes().filter((route) => isMenuRouteVisible(route));
});

const visibleNormMenus = computed(() => visibleRoutes.value.filter((item) => item.meta?.roles?.includes("normal") || item.meta?.roles?.includes("scorer")));
const visibleStatisticMenus = computed(() => visibleRoutes.value.filter((item) => isStatisticRoute(item)));
const visibleAdminMenus = computed(() => visibleRoutes.value.filter((item) => item.meta?.roles?.includes("admin") && !isStatisticRoute(item) && !visibleNormMenus.value.some((normItem) => normItem.path === item.path)));
const visibleSuperAdminMenus = computed(() => visibleRoutes.value.filter((item) => item.meta?.roles?.includes("super_admin") && !isStatisticRoute(item) && !item.meta?.roles?.includes("admin")));
const statisticActivePaths = computed(() => visibleStatisticMenus.value.map((item) => item.path));
const adminActivePaths = computed(() => visibleAdminMenus.value.map((item) => item.path));
const superAdminActivePaths = computed(() => visibleSuperAdminMenus.value.map((item) => item.path));
const collapsedMenus = computed(() => {
  const menus = visibleNormMenus.value.map((item) => toMenuItem(item, "norm"));

  if (userStore.isAdmin) {
    menus.push(
      ...visibleAdminMenus.value.map((item) => toMenuItem(item, "admin")),
      ...visibleStatisticMenus.value.map((item) => toMenuItem(item, "statistic"))
    );
  }

  if (userStore.isSuperAdmin) {
    menus.push(
      ...visibleSuperAdminMenus.value.map((item) => toMenuItem(item, "super"))
    );
  }

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
