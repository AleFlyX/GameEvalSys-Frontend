<template>
  <aside class="sidebar-menu" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-head">
      <div class="brand-wrap">
        <span class="brand-mark">GE</span>
        <span v-show="!isCollapsed" class="title">项目评分平台</span>
      </div>

      <button class="collapse-btn" type="button" :aria-label="isCollapsed ? '展开侧边栏' : '收起侧边栏'" @click="toggleSidebar">
        <span class="collapse-chev" :class="{ collapsed: isCollapsed }"></span>
      </button>
    </div>

    <ul v-if="!isCollapsed" class="nav-items">
      <MenuItem v-for="item in visibleNormMenus" :key="item.path" :index="item.path"
        :label="item.meta?.title || item.name">
      <template #prefix>
        <el-icon>
          <component :is="elementIconMap[item.meta.icon] || null" />
        </el-icon>
      </template>
      </MenuItem>

      <MenuFolder v-if="userStore.isAdmin" base-index="/admin" label="管理面板" :collapsed="isCollapsed">
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

      <MenuFolder v-if="userStore.isSuperAdmin" base-index="/super-admin" label="后台管理" :collapsed="isCollapsed">
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
import { norm } from "@/router/modules/normalRoutes";
import { admin } from "@/router/modules/adminRoutes";
import { superAdmin } from "@/router/modules/superAdminRoutes";
import { useUserStore } from "@/stores/modules/userStore";
import { elementIconMap } from "@/utils/elementIcons";
import MenuItem from "./components/menuItem.vue";
import MenuFolder from "./components/menuFolder.vue";

defineOptions({
  name: "SidebarMenu",
});

const userStore = useUserStore();

// 找出可直接进入的路径
const visibleNormMenus = computed(() => norm.filter((item) => !item.meta?.hidden));
const visibleAdminMenus = computed(() => admin.filter((item) => !item.meta?.hidden));
const visibleSuperAdminMenus = computed(() =>
  superAdmin.filter((item) => !item.meta?.hidden)
);
const collapsedMenus = computed(() => {
  const menus = visibleNormMenus.value.map((item) => ({
    key: `norm-${item.path}`,
    path: item.path,
    label: item.meta?.title || item.name,
    icon: item.meta?.icon,
  }));

  if (userStore.isAdmin) {
    menus.push(
      ...visibleAdminMenus.value.map((item) => ({
        key: `admin-${item.path}`,
        path: item.path,
        label: item.meta?.title || item.name,
        icon: item.meta?.icon,
      }))
    );
  }

  if (userStore.isSuperAdmin) {
    menus.push(
      ...visibleSuperAdminMenus.value.map((item) => ({
        key: `super-${item.path}`,
        path: item.path,
        label: item.meta?.title || item.name,
        icon: item.meta?.icon,
      }))
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
  --sidebar-border: rgba(15, 23, 42, 0.08);
  --sidebar-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);

  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 10px 12px;
  background: linear-gradient(170deg, rgba(255, 255, 255, 0.96), rgba(245, 247, 250, 0.9));
  backdrop-filter: saturate(160%) blur(16px);
  color: #1f2937;
  height: 100%;
  width: 248px;
  transition: width 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--sidebar-shadow);
  border-right: 1px solid var(--sidebar-border);
  overflow: hidden;
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

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
  background: linear-gradient(135deg, #0a84ff, #0a69d7);
  box-shadow: 0 8px 18px rgba(10, 132, 255, 0.35);
}

.title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-btn {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  border-color: rgba(10, 132, 255, 0.35);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.1);
  background: rgba(255, 255, 255, 0.92);
}

.collapse-chev {
  width: 7px;
  height: 7px;
  border-right: 2px solid #475569;
  border-bottom: 2px solid #475569;
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
  overflow: auto;
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
