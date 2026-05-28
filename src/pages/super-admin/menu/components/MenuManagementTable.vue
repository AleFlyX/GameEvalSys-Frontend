<template>
  <div class="menu-table-shell">
    <el-table v-loading="loading" :data="menus" row-key="id" stripe class="menu-table" :style="{ minWidth: '1120px' }">
      <el-table-column label="菜单名称" min-width="220" show-overflow-tooltip>
        <template #default="scope">
          <div class="menu-title-cell" :style="{ paddingLeft: `${(scope.row.depth || 0) * 20}px` }">
            <button v-if="scope.row.children?.length" type="button" class="menu-tree-toggle"
              :aria-label="isMenuBranchExpanded(scope.row) ? '收起子菜单' : '展开子菜单'"
              @click.stop="emit('toggle-branch', scope.row)">
              <el-icon>
                <component
                  :is="isMenuBranchExpanded(scope.row) ? getElementIcon('ArrowDown') : getElementIcon('ArrowRight')" />
              </el-icon>
            </button>
            <span v-else class="menu-tree-spacer" aria-hidden="true"></span>
            <el-icon v-if="scope.row.icon" class="menu-title-icon">
              <component :is="getElementIcon(scope.row.icon)" />
            </el-icon>
            <div class="menu-title-copy">
              <span class="menu-title">{{ scope.row.title || '-' }}</span>
              <span class="menu-subtitle">{{ scope.row.menuCode || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="menuType" label="类型" min-width="120">
        <template #default="scope">
          <el-tag :type="menuTypeTagMap[scope.row.menuType] || 'info'" effect="light">
            {{ menuTypeLabelMap[scope.row.menuType] || scope.row.menuType || '-' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="path" label="路径" min-width="180" show-overflow-tooltip />

      <el-table-column prop="sortNum" label="排序" width="90" align="center" />

      <el-table-column label="状态" min-width="150">
        <template #default="scope">
          <el-space wrap :size="8">
            <el-tag :type="scope.row.isEnabled ? 'success' : 'danger'" effect="light">
              {{ scope.row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
            <el-tag :type="scope.row.hidden ? 'warning' : 'info'" effect="light">
              {{ scope.row.hidden ? '隐藏' : '显示' }}
            </el-tag>
          </el-space>
        </template>
      </el-table-column>

      <el-table-column type="expand" width="56">
        <template #default="scope">
          <div class="menu-expand-panel">
            <div class="menu-expand-header"
              style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div class="menu-expand-summary">
                <div class="menu-expand-title">
                  <span class="menu-expand-name">{{ scope.row.title || '-' }}</span>
                  <el-tag :type="menuTypeTagMap[scope.row.menuType] || 'info'" effect="light" size="small">
                    {{ menuTypeLabelMap[scope.row.menuType] || scope.row.menuType || '-' }}
                  </el-tag>
                </div>
                <p class="menu-expand-desc">
                  路由详细信息
                </p>
              </div>
              <el-button size="small" type="danger" @click="emit('delete', scope.row)">
                删除
              </el-button>
            </div>
            <div class="menu-expand-grid">
              <div class="menu-expand-item">
                <span class="expand-label">路由名</span>
                <span class="expand-value">{{ scope.row.routeName || '-' }}</span>
              </div>
              <div class="menu-expand-item">
                <span class="expand-label">组件编码</span>
                <span class="expand-value">{{ scope.row.componentCode || '-' }}</span>
              </div>
              <div class="menu-expand-item">
                <span class="expand-label">角色范围</span>
                <div class="role-tag-list expand-role-list">
                  <el-tag v-for="role in normalizeRoleCodes(scope.row.roleCodes)"
                    :key="`expand-${scope.row.id}-${role}`" size="small" effect="plain">
                    {{ roleLabelMap[role] || role }}
                  </el-tag>
                  <span v-if="!normalizeRoleCodes(scope.row.roleCodes).length" class="muted-text">-</span>
                </div>
              </div>
              <div class="menu-expand-item">
                <span class="expand-label">父级ID</span>
                <span class="expand-value">{{ scope.row.parentId ?? '根节点' }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" plain @click="emit('create-child', scope.row)">
            {{ scope.row.menuType === 'menu' ? '新增业务子菜单' : '新增子菜单' }}
          </el-button>
          <el-button size="small" @click="emit('edit', scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { getElementIcon } from '@/utils/elementIcons';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  menus: {
    type: Array,
    default: () => [],
  },
  menuTypeLabelMap: {
    type: Object,
    default: () => ({}),
  },
  menuTypeTagMap: {
    type: Object,
    default: () => ({}),
  },
  roleLabelMap: {
    type: Object,
    default: () => ({}),
  },
  normalizeRoleCodes: {
    type: Function,
    default: (value) => (Array.isArray(value) ? value : []),
  },
  isMenuBranchExpanded: {
    type: Function,
    default: () => false,
  },
});

const emit = defineEmits(['toggle-branch', 'create-child', 'edit', 'delete']);
</script>

<style scoped>
.menu-table-shell {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 18px;
}

.menu-table {
  border-radius: 18px;
}

.menu-title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.menu-tree-toggle,
.menu-tree-spacer {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-tree-toggle {
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.menu-tree-toggle:hover {
  background: rgba(37, 99, 235, 0.08);
}

.menu-title-icon {
  color: #2563eb;
  flex-shrink: 0;
}

.menu-title-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.menu-title {
  font-weight: 600;
  color: var(--text);
}

.menu-subtitle,
.muted-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.role-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.menu-expand-panel {
  display: grid;
  gap: 14px;
  padding: 8px 5%;
}

.menu-expand-summary {
  display: grid;
  gap: 6px;
}

.menu-expand-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.menu-expand-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.menu-expand-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.menu-expand-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.menu-expand-item {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.expand-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.expand-value {
  font-size: 13px;
  color: var(--text);
  word-break: break-all;
}

.expand-role-list {
  margin-top: 2px;
}

@media (max-width: 768px) {
  .menu-table-shell {
    border-radius: 14px;
  }

  .menu-table {
    min-width: 980px;
  }

  .menu-expand-panel {
    padding: 4px 0;
  }

  .menu-expand-grid {
    grid-template-columns: 1fr;
  }
}
</style>
