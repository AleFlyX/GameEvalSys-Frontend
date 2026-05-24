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

    <div v-if="isDevMode" class="menu-debug-panel">
      <el-alert title="菜单调试输出" type="info" :closable="false" show-icon>
        <div class="menu-debug-content">
          <div class="menu-debug-row">
            <span>根节点数</span>
            <strong>{{ menuDebugInfo.rootCount }}</strong>
          </div>
          <div class="menu-debug-row">
            <span>可见节点数</span>
            <strong>{{ menuDebugInfo.visibleCount }}</strong>
          </div>
          <div class="menu-debug-row">
            <span>展开 key 数</span>
            <strong>{{ menuDebugInfo.expandedCount }}</strong>
          </div>
          <div class="menu-debug-row">
            <span>渲染行数</span>
            <strong>{{ menuDebugInfo.renderedCount }}</strong>
          </div>
          <div class="menu-debug-row menu-debug-row--full">
            <span>根节点摘要</span>
            <pre>{{ menuDebugInfo.rootSummaryText }}</pre>
          </div>
        </div>
      </el-alert>
    </div>

    <template #main-table>
      <div class="menu-table-shell">
        <el-table v-loading="loading" :data="renderedMenus" row-key="id" stripe class="menu-table"
          :style="{ minWidth: '1120px' }">
          <el-table-column label="菜单名称" min-width="220" show-overflow-tooltip>
            <template #default="scope">
              <div class="menu-title-cell" :style="{ paddingLeft: `${(scope.row.depth || 0) * 20}px` }">
                <button v-if="scope.row.children?.length" type="button" class="menu-tree-toggle"
                  :aria-label="isMenuBranchExpanded(scope.row) ? '收起子菜单' : '展开子菜单'"
                  @click.stop="toggleMenuBranch(scope.row)">
                  <el-icon>
                    <component :is="isMenuBranchExpanded(scope.row) ? ArrowDown : ArrowRight" />
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
                <div class="menu-expand-summary">
                  <div class="menu-expand-title">
                    <span class="menu-expand-name">{{ scope.row.title || '-' }}</span>
                    <el-tag :type="menuTypeTagMap[scope.row.menuType] || 'info'" effect="light" size="small">
                      {{ menuTypeLabelMap[scope.row.menuType] || scope.row.menuType || '-' }}
                    </el-tag>
                  </div>
                  <p class="menu-expand-desc">
                    这个展开区块用于承载次要信息，减少主表列宽压力。
                  </p>
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
              <el-button size="small" type="primary" plain @click="openCreateChildDialog(scope.row)">
                新增子菜单
              </el-button>
              <el-button size="small" @click="openEditDialog(scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="!loading && renderedMenus.length === 0" class="empty-state">
        <p>暂无可展示菜单，请先新增菜单</p>
      </div>
    </template>

    <template #modals>
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760px" class="menu-form-dialog" destroy-on-close>
        <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="100px" status-icon>
          <el-form-item label="上级菜单" prop="parentId">
            <el-select v-model="formModel.parentId" placeholder="无上级菜单" clearable filterable style="width: 100%">
              <el-option v-for="option in parentOptions" :key="option.id" :label="option.label" :value="option.id"
                :disabled="option.disabled" />
            </el-select>
          </el-form-item>

          <el-form-item label="菜单名称" prop="title">
            <el-input v-model="formModel.title" placeholder="请输入菜单名称" />
          </el-form-item>

          <el-form-item label="菜单编码" prop="menuCode">
            <el-input v-model="formModel.menuCode" placeholder="请输入菜单编码" :disabled="isEditing" />
          </el-form-item>

          <el-form-item label="菜单类型" prop="menuType">
            <el-select v-model="formModel.menuType" placeholder="请选择菜单类型" filterable allow-create style="width: 100%">
              <el-option label="目录" value="catalog" />
              <el-option label="菜单" value="menu" />
              <el-option label="按钮" value="button" />
            </el-select>
          </el-form-item>

          <el-form-item label="路径" prop="path">
            <el-input v-model="formModel.path" placeholder="请输入路由路径，例如 /admin/menu" />
          </el-form-item>

          <el-form-item label="路由名" prop="routeName">
            <el-input v-model="formModel.routeName" placeholder="请输入路由名称" />
          </el-form-item>

          <el-form-item label="组件编码" prop="componentCode">
            <el-input v-model="formModel.componentCode" placeholder="请输入 componentCode，目录类型可留空" />
          </el-form-item>

          <el-form-item label="图标" prop="icon">
            <div class="icon-input-row">
              <el-input v-model="formModel.icon" placeholder="请输入图标名称，例如 Grid、Setting、Management" />
              <div class="icon-preview" :class="{ 'is-empty': !formModel.icon }">
                <el-icon v-if="formModel.icon">
                  <component :is="getElementIcon(formModel.icon)" />
                </el-icon>
                <span v-else>预览</span>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="排序" prop="sortNum">
            <el-input-number v-model="formModel.sortNum" :min="0" :step="1" controls-position="right"
              style="width: 100%" />
          </el-form-item>

          <el-form-item label="可见状态" prop="hidden">
            <el-switch v-model="formModel.hidden" active-text="隐藏" inactive-text="显示" />
          </el-form-item>

          <el-form-item label="启用状态" prop="isEnabled">
            <el-switch v-model="formModel.isEnabled" active-text="启用" inactive-text="禁用" />
          </el-form-item>

          <el-form-item label="角色范围" prop="roleCodes">
            <el-checkbox-group v-model="formModel.roleCodes">
              <el-checkbox v-for="role in roleOptions" :key="role.value" :label="role.value">
                {{ role.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>

    </template>
  </PagePanel>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { ArrowDown, ArrowRight } from '@element-plus/icons-vue';

import { menuApi } from '@/api/menu';
import PagePanel from '@/layouts/PagePanel.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import StatCard from '@/components/common/data/StatCard.vue';
import { showMsgBox } from '@/utils/ConfirmBox';
import { getElementIcon } from '@/utils/elementIcons';
import { useMessage } from '@/composables/useMessage';

defineOptions({
  name: 'SuperAdminMenuManagementPage',
});

const message = useMessage();
const loading = ref(false);
const submitLoading = ref(false);
const menuTree = ref([]);
const searchKeyword = ref('');
const dialogVisible = ref(false);
const formRef = ref(null);
const editingId = ref(null);
const blockedParentIds = ref(new Set());
const expandedMenuIds = ref(new Set());

const filterState = reactive({
  isEnabled: '',
  hidden: '',
});

const roleOptions = [
  { label: '超级管理员', value: 'super_admin' },
  { label: '管理员', value: 'admin' },
  { label: '打分用户', value: 'scorer' },
  { label: '普通用户', value: 'normal' },
];

const roleLabelMap = Object.fromEntries(roleOptions.map((item) => [item.value, item.label]));

const menuTypeLabelMap = {
  catalog: '目录',
  menu: '菜单',
  button: '按钮',
};

const menuTypeTagMap = {
  catalog: 'info',
  menu: 'primary',
  button: 'success',
};

const defaultFormModel = () => ({
  id: null,
  parentId: null,
  menuCode: '',
  menuType: 'menu',
  title: '',
  path: '',
  routeName: '',
  icon: '',
  hidden: false,
  componentCode: '',
  sortNum: 0,
  isEnabled: true,
  roleCodes: [],
});

const formModel = reactive(defaultFormModel());

const normalizeBool = (value) => value === true || value === 1 || value === '1';

const normalizeRoleCodes = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const normalizeMenuNode = (node) => ({
  ...node,
  hidden: normalizeBool(node?.hidden),
  isEnabled: node?.isEnabled === undefined ? true : normalizeBool(node?.isEnabled),
  roleCodes: normalizeRoleCodes(node?.roleCodes),
  children: Array.isArray(node?.children) ? node.children.map((child) => normalizeMenuNode(child)) : [],
});

const cloneMenuTree = (nodes = []) => nodes.map((node) => normalizeMenuNode(node));

const flattenMenus = (nodes = [], depth = 0, collector = []) => {
  nodes.forEach((node) => {
    collector.push({
      id: node.id,
      label: `${'　'.repeat(depth)}${node.title || node.menuCode || `菜单 ${node.id}`}`,
      disabled: blockedParentIds.value.has(node.id),
    });
    if (Array.isArray(node.children) && node.children.length) {
      flattenMenus(node.children, depth + 1, collector);
    }
  });
  return collector;
};

const collectDescendantIds = (nodes = [], targetId) => {
  const foundIds = [];

  const visit = (list = []) => {
    for (const node of list) {
      if (node.id === targetId) {
        const walkChildren = (children = []) => {
          for (const child of children) {
            foundIds.push(child.id);
            if (Array.isArray(child.children) && child.children.length) {
              walkChildren(child.children);
            }
          }
        };
        walkChildren(node.children || []);
        return true;
      }
      if (Array.isArray(node.children) && node.children.length && visit(node.children)) {
        return true;
      }
    }
    return false;
  };

  visit(nodes);
  return foundIds;
};

const flattenRenderedMenus = (nodes = [], depth = 0, collector = []) => {
  nodes.forEach((node) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    collector.push({
      ...node,
      depth,
      hasChildren,
    });

    if (hasChildren && expandedMenuIds.value.has(node.id)) {
      flattenRenderedMenus(node.children, depth + 1, collector);
    }
  });

  return collector;
};

const collectBranchExpandableIds = (nodes = [], collector = []) => {
  nodes.forEach((node) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    if (hasChildren) {
      collector.push(node.id);
      collectBranchExpandableIds(node.children, collector);
    }
  });

  return collector;
};

const applyStatusFilter = (nodes = []) => {
  return nodes.reduce((acc, node) => {
    const children = applyStatusFilter(node.children || []);
    const matchesEnabled = filterState.isEnabled === '' || node.isEnabled === filterState.isEnabled;
    const matchesHidden = filterState.hidden === '' || node.hidden === filterState.hidden;

    if (matchesEnabled && matchesHidden) {
      acc.push({ ...node, children });
      return acc;
    }

    if (children.length > 0) {
      acc.push({ ...node, children });
    }

    return acc;
  }, []);
};

const applyKeywordFilter = (nodes = [], keyword = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return nodes;
  }

  const isMatched = (node) => {
    const searchableText = [
      node.title,
      node.menuCode,
      node.path,
      node.routeName,
      node.componentCode,
      node.icon,
      ...(Array.isArray(node.roleCodes) ? node.roleCodes : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedKeyword);
  };

  const walk = (list = []) => {
    return list.reduce((acc, node) => {
      const nextChildren = walk(node.children || []);
      if (isMatched(node)) {
        acc.push({ ...node, children: node.children || [] });
        return acc;
      }
      if (nextChildren.length > 0) {
        acc.push({ ...node, children: nextChildren });
      }
      return acc;
    }, []);
  };

  return walk(nodes);
};

const visibleMenus = computed(() => {
  const filteredByStatus = applyStatusFilter(menuTree.value);
  return applyKeywordFilter(filteredByStatus, searchKeyword.value);
});

const renderedMenus = computed(() => flattenRenderedMenus(visibleMenus.value, 0, []));

const isDevMode = import.meta.env.DEV;

const menuDebugInfo = computed(() => {
  const rootSummaryText = (menuTree.value || [])
    .map((node) => {
      const childCount = Array.isArray(node.children) ? node.children.length : 0;
      return `${node.id}:${node.title || node.menuCode || '-'}(${childCount})`;
    })
    .join(' | ');

  return {
    rootCount: Array.isArray(menuTree.value) ? menuTree.value.length : 0,
    visibleCount: flattenMenus(visibleMenus.value, 0, []).length,
    renderedCount: renderedMenus.value.length,
    expandedCount: expandedMenuIds.value.size,
    rootSummaryText: rootSummaryText || '-',
  };
});

const menuStats = computed(() => {
  const flatMenus = flattenMenus(visibleMenus.value, 0, []);
  return flatMenus.reduce((acc, node) => {
    acc.total += 1;
    if (node.isEnabled !== false) acc.enabled += 1;
    if (node.hidden) acc.hidden += 1;
    if (!Array.isArray(node.children) || node.children.length === 0) acc.leaf += 1;
    return acc;
  }, { total: 0, enabled: 0, hidden: 0, leaf: 0 });
});

const parentOptions = computed(() => flattenMenus(menuTree.value, 0, []));
const isEditing = computed(() => editingId.value !== null);
const dialogTitle = computed(() => (isEditing.value ? '编辑菜单' : '新增菜单'));

const formRules = {
  parentId: [],
  menuCode: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
  routeName: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
  componentCode: [{ validator: validateComponentCode, trigger: 'blur' }],
};

function validateComponentCode(_rule, value, callback) {
  if (formModel.menuType === 'catalog') {
    callback();
    return;
  }

  if (!String(value || '').trim()) {
    callback(new Error('非目录菜单请填写组件编码'));
    return;
  }

  callback();
}

function resetForm() {
  Object.assign(formModel, defaultFormModel());
  blockedParentIds.value = new Set();
  editingId.value = null;
  formRef.value?.clearValidate?.();
}

function normalizeMenuRecord(record) {
  return {
    ...record,
    parentId: record?.parentId ?? null,
    menuCode: record?.menuCode || '',
    menuType: record?.menuType || 'menu',
    title: record?.title || '',
    path: record?.path || '',
    routeName: record?.routeName || '',
    icon: record?.icon || '',
    hidden: normalizeBool(record?.hidden),
    componentCode: record?.componentCode || '',
    sortNum: Number(record?.sortNum || 0),
    isEnabled: record?.isEnabled === undefined ? true : normalizeBool(record?.isEnabled),
    roleCodes: normalizeRoleCodes(record?.roleCodes),
  };
}

async function fetchMenus() {
  loading.value = true;
  try {
    const response = await menuApi.getMenuTree();
    const rawData = response?.data;
    const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.list) ? rawData.list : [];
    menuTree.value = cloneMenuTree(list);
    expandedMenuIds.value = new Set(collectBranchExpandableIds(menuTree.value, []));
  } catch (error) {
    message.error('获取菜单树失败');
    console.error('Failed to load menu tree:', error);
  } finally {
    loading.value = false;
  }
}

function handleSearch(keyword) {
  searchKeyword.value = keyword || '';
}

function handleRefresh() {
  fetchMenus();
}

function isMenuBranchExpanded(row) {
  return expandedMenuIds.value.has(row.id);
}

function toggleMenuBranch(row) {
  if (!row || !Array.isArray(row.children) || row.children.length === 0) return;

  const nextExpanded = new Set(expandedMenuIds.value);
  const branchIds = collectBranchExpandableIds([row], []);

  if (nextExpanded.has(row.id)) {
    branchIds.forEach((id) => nextExpanded.delete(id));
  } else {
    branchIds.forEach((id) => nextExpanded.add(id));
  }

  expandedMenuIds.value = nextExpanded;
}

function openCreateDialog() {
  resetForm();
  dialogVisible.value = true;
}

function openCreateChildDialog(row) {
  resetForm();
  formModel.parentId = row?.id ?? null;
  formModel.menuType = 'menu';
  dialogVisible.value = true;
}

function openEditDialog(row) {
  resetForm();
  const detail = normalizeMenuRecord(row);
  editingId.value = detail.id;
  blockedParentIds.value = new Set([detail.id, ...collectDescendantIds(menuTree.value, detail.id)]);
  Object.assign(formModel, detail);
  dialogVisible.value = true;
}

async function handleDelete(row) {
  if (!row?.id) return;

  const hasChildren = Array.isArray(row.children) && row.children.length > 0;
  try {
    await showMsgBox(
      '删除菜单',
      hasChildren ? `确认删除菜单“${row.title || row.menuCode}”？其子菜单也会一并删除。` : `确认删除菜单“${row.title || row.menuCode}”？`,
      { type: 'danger', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    );
    await menuApi.deleteMenu(row.id);
    message.success('删除成功');
    await fetchMenus();
  } catch (error) {
    if (error !== 'cancel') {
      message.error('删除失败');
      console.error('Failed to delete menu:', error);
    }
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate?.();
  } catch {
    return;
  }

  const payload = {
    parentId: formModel.parentId || null,
    menuCode: String(formModel.menuCode || '').trim(),
    menuType: String(formModel.menuType || '').trim(),
    title: String(formModel.title || '').trim(),
    path: String(formModel.path || '').trim(),
    routeName: String(formModel.routeName || '').trim(),
    icon: String(formModel.icon || '').trim() || undefined,
    hidden: !!formModel.hidden,
    componentCode: String(formModel.componentCode || '').trim() || undefined,
    sortNum: Number(formModel.sortNum || 0),
    isEnabled: !!formModel.isEnabled,
    roleCodes: Array.isArray(formModel.roleCodes) ? [...formModel.roleCodes] : [],
  };

  if (payload.menuType === 'catalog') {
    delete payload.componentCode;
  }

  submitLoading.value = true;
  try {
    if (isEditing.value) {
      await menuApi.updateMenu(editingId.value, payload);
      message.success('菜单已更新');
    } else {
      await menuApi.createMenu(payload);
      message.success('菜单已创建');
    }
    dialogVisible.value = false;
    await fetchMenus();
  } catch (error) {
    message.error(isEditing.value ? '更新菜单失败' : '创建菜单失败');
    console.error('Failed to submit menu:', error);
  } finally {
    submitLoading.value = false;
  }
}

onMounted(() => {
  fetchMenus();
});

watch(
  [searchKeyword, () => filterState.isEnabled, () => filterState.hidden],
  () => {
    expandedMenuIds.value = new Set(collectBranchExpandableIds(visibleMenus.value, []));
  },
  { flush: 'post' }
);
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

.menu-debug-panel {
  margin: 12px 0 4px;
}

.menu-debug-content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 16px;
  align-items: start;
}

.menu-debug-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.04);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.menu-debug-row strong {
  color: var(--text);
}

.menu-debug-row--full {
  grid-column: 1 / -1;
  align-items: flex-start;
}

.menu-debug-row--full pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

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

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
  color: var(--el-text-color-placeholder);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.icon-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.icon-preview {
  width: 48px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
  flex-shrink: 0;
}

.icon-preview.is-empty {
  color: var(--text-secondary);
}

:deep(.menu-form-dialog .el-dialog__body) {
  padding-top: 14px;
}

@media (max-width: 768px) {
  .menu-debug-content {
    grid-template-columns: 1fr;
  }

  .menu-toolbar-filters {
    width: 100%;
  }

  .menu-toolbar-filters :deep(.el-select),
  .menu-toolbar-filters :deep(.el-button) {
    flex: 1 1 130px;
  }

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

  .icon-input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .icon-preview {
    width: 100%;
  }
}

.menu-expand-panel {
  display: grid;
  gap: 14px;
  padding: 8px 16px 16px 6px;
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
</style>
