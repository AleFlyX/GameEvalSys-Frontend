<template>
  <PagePanel class="menu-management-page">
    <template #header>
      <StatCard label="菜单总数" :value="String(menuStats.total)" icon="Grid" icon-color="#2563eb"
        icon-bg="rgba(37, 99, 235, 0.12)" />
      <StatCard label="启用菜单" :value="String(menuStats.enabled)" icon="Checked" icon-color="#16a34a"
        icon-bg="rgba(22, 163, 74, 0.12)" />
      <StatCard label="隐藏菜单" :value="String(menuStats.hidden)" icon="Warning" icon-color="#d97706"
        icon-bg="rgba(217, 119, 6, 0.14)" />
      <StatCard label="叶子节点" :value="String(menuStats.leaf)" icon="Document" icon-color="#0f766e"
        icon-bg="rgba(15, 118, 110, 0.12)" />
    </template>

    <SearchInput size="middle" placeholder="搜索菜单名称、编码、路径或路由名" add-btn-text="新增菜单" @search="handleSearch"
      @add="openCreateDialog">
      <template #operations>
        <div class="menu-toolbar-filters">
          <el-select v-model="filterState.isEnabled" placeholder="启用状态" clearable style="width: 140px">
            <el-option label="全部状态" :value="''" />
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
          <el-select v-model="filterState.hidden" placeholder="显示状态" clearable style="width: 140px">
            <el-option label="全部显示" :value="''" />
            <el-option label="显示" :value="false" />
            <el-option label="隐藏" :value="true" />
          </el-select>
          <el-button :loading="loading" @click="handleRefresh">
            刷新
          </el-button>
        </div>
      </template>
    </SearchInput>

    <MenuDebugPanel :menu-debug-info="menuDebugInfo" />

    <template #main-table>
      <MenuManagementTable :loading="loading" :menus="renderedMenus" :menu-type-label-map="menuTypeLabelMap"
        :menu-type-tag-map="menuTypeTagMap" :role-label-map="roleLabelMap" :normalize-role-codes="normalizeRoleCodes"
        :is-menu-branch-expanded="isMenuBranchExpanded" @toggle-branch="toggleMenuBranch"
        @create-child="openCreateChildDialog" @edit="openEditDialog" @delete="handleDelete" />

      <div v-if="!loading && renderedMenus.length === 0" class="empty-state">
        <p>暂无可展示菜单，请先新增菜单</p>
      </div>
    </template>

    <template #modals>
      <MenuFormDialog v-model:visible="dialogVisible" :title="dialogTitle" :form-model="formModel"
        :parent-options="parentOptions" :role-options="roleOptions" :loading="submitLoading" :is-editing="isEditing"
        @submit="handleSubmit" />
    </template>
  </PagePanel>
</template>

<script setup>
import { onMounted } from 'vue';

import PagePanel from '@/layouts/PagePanel.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import StatCard from '@/components/common/data/StatCard.vue';

import MenuDebugPanel from './components/MenuDebugPanel.vue';
import MenuFormDialog from './components/MenuFormDialog.vue';
import MenuManagementTable from './components/MenuManagementTable.vue';
import { useMenuManagement } from './composables/useMenuManagement';

defineOptions({
  name: 'SuperAdminMenuManagementPage',
});

const {
  loading,
  submitLoading,
  dialogVisible,
  formModel,
  roleOptions,
  roleLabelMap,
  menuTypeLabelMap,
  menuTypeTagMap,
  parentOptions,
  renderedMenus,
  menuStats,
  menuDebugInfo,
  filterState,
  isEditing,
  dialogTitle,
  normalizeRoleCodes,
  handleSearch,
  handleRefresh,
  isMenuBranchExpanded,
  toggleMenuBranch,
  openCreateDialog,
  openCreateChildDialog,
  openEditDialog,
  handleDelete,
  submitMenu,
} = useMenuManagement();

const handleSubmit = async (formData) => {
  await submitMenu(formData);
};

onMounted(() => {
  handleRefresh();
});
</script>

<style scoped>
.menu-management-page {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(37, 99, 235, 0.08), transparent 22%),
    linear-gradient(180deg, #eef3fb 0%, #f7f9fd 100%);
}

.menu-toolbar-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
  color: var(--el-text-color-placeholder);
}

@media (max-width: 768px) {
  .menu-toolbar-filters {
    width: 100%;
  }

  .menu-toolbar-filters :deep(.el-select),
  .menu-toolbar-filters :deep(.el-button) {
    flex: 1 1 130px;
  }
}
</style>
