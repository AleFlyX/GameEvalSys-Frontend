import { computed, onMounted, reactive, ref, watch } from 'vue';

import { menuApi } from '@/api/menu';
import { useMessage } from '@/composables/useMessage';
import { showMsgBox } from '@/utils/ConfirmBox';

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

const flattenMenus = (nodes = [], depth = 0, collector = [], blockedParentIds = new Set()) => {
  nodes.forEach((node) => {
    collector.push({
      id: node.id,
      label: `${'　'.repeat(depth)}${node.title || node.menuCode || `菜单 ${node.id}`}`,
      disabled: blockedParentIds.has(node.id),
    });

    if (Array.isArray(node.children) && node.children.length) {
      flattenMenus(node.children, depth + 1, collector, blockedParentIds);
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

const flattenRenderedMenus = (nodes = [], expandedMenuIds = new Set(), depth = 0, collector = []) => {
  nodes.forEach((node) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    collector.push({
      ...node,
      depth,
      hasChildren,
    });

    if (hasChildren && expandedMenuIds.has(node.id)) {
      flattenRenderedMenus(node.children, expandedMenuIds, depth + 1, collector);
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

const applyStatusFilter = (nodes = [], filterState = { isEnabled: '', hidden: '' }) => {
  return nodes.reduce((acc, node) => {
    const children = applyStatusFilter(node.children || [], filterState);
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

const normalizeMenuRecord = (record) => ({
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
});

const buildMenuPayload = (formData = {}) => {
  const payload = {
    parentId: formData.parentId ?? null,
    menuCode: String(formData.menuCode || '').trim(),
    menuType: String(formData.menuType || '').trim(),
    title: String(formData.title || '').trim(),
    path: String(formData.path || '').trim(),
    routeName: String(formData.routeName || '').trim(),
    icon: String(formData.icon || '').trim() || undefined,
    hidden: !!formData.hidden,
    componentCode: String(formData.componentCode || '').trim() || undefined,
    sortNum: Number(formData.sortNum || 0),
    isEnabled: !!formData.isEnabled,
    roleCodes: Array.isArray(formData.roleCodes) ? [...formData.roleCodes] : [],
  };

  if (payload.menuType === 'catalog') {
    delete payload.componentCode;
  }

  return payload;
};

export const useMenuManagement = () => {
  const message = useMessage();
  const loading = ref(false);
  const submitLoading = ref(false);
  const menuTree = ref([]);
  const searchKeyword = ref('');
  const dialogVisible = ref(false);
  const editingId = ref(null);
  const blockedParentIds = ref(new Set());
  const expandedMenuIds = ref(new Set());

  const filterState = reactive({
    isEnabled: '',
    hidden: '',
  });

  const formModel = reactive(defaultFormModel());

  const resetForm = () => {
    Object.assign(formModel, defaultFormModel());
    blockedParentIds.value = new Set();
    editingId.value = null;
  };

  const visibleMenus = computed(() => {
    const filteredByStatus = applyStatusFilter(menuTree.value, filterState);
    return applyKeywordFilter(filteredByStatus, searchKeyword.value);
  });

  const renderedMenus = computed(() => flattenRenderedMenus(visibleMenus.value, expandedMenuIds.value, 0, []));

  const menuDebugInfo = computed(() => {
    const rootSummaryText = (menuTree.value || [])
      .map((node) => {
        const childCount = Array.isArray(node.children) ? node.children.length : 0;
        return `${node.id}:${node.title || node.menuCode || '-'}(${childCount})`;
      })
      .join(' | ');

    return {
      rootCount: Array.isArray(menuTree.value) ? menuTree.value.length : 0,
      visibleCount: flattenMenus(visibleMenus.value, 0, [], blockedParentIds.value).length,
      renderedCount: renderedMenus.value.length,
      expandedCount: expandedMenuIds.value.size,
      rootSummaryText: rootSummaryText || '-',
    };
  });

  const menuStats = computed(() => {
    const flatMenus = flattenMenus(visibleMenus.value, 0, [], blockedParentIds.value);
    return flatMenus.reduce((acc, node) => {
      acc.total += 1;
      if (node.isEnabled !== false) acc.enabled += 1;
      if (node.hidden) acc.hidden += 1;
      if (!Array.isArray(node.children) || node.children.length === 0) acc.leaf += 1;
      return acc;
    }, { total: 0, enabled: 0, hidden: 0, leaf: 0 });
  });

  const parentOptions = computed(() => flattenMenus(menuTree.value, 0, [], blockedParentIds.value));
  const isEditing = computed(() => editingId.value !== null);
  const dialogTitle = computed(() => (isEditing.value ? '编辑菜单' : '新增菜单'));

  const fetchMenus = async () => {
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
  };

  const handleSearch = (keyword) => {
    searchKeyword.value = keyword || '';
  };

  const handleRefresh = async () => {
    await fetchMenus();
  };

  const isMenuBranchExpanded = (row) => expandedMenuIds.value.has(row.id);

  const toggleMenuBranch = (row) => {
    if (!row || !Array.isArray(row.children) || row.children.length === 0) return;

    const nextExpanded = new Set(expandedMenuIds.value);
    const branchIds = collectBranchExpandableIds([row], []);

    if (nextExpanded.has(row.id)) {
      branchIds.forEach((id) => nextExpanded.delete(id));
    } else {
      branchIds.forEach((id) => nextExpanded.add(id));
    }

    expandedMenuIds.value = nextExpanded;
  };

  const openCreateDialog = () => {
    resetForm();
    dialogVisible.value = true;
  };

  const openCreateChildDialog = (row) => {
    resetForm();
    formModel.parentId = row?.id ?? null;
    formModel.menuType = 'menu';
    dialogVisible.value = true;
  };

  const openEditDialog = (row) => {
    resetForm();
    const detail = normalizeMenuRecord(row);
    editingId.value = detail.id;
    blockedParentIds.value = new Set([detail.id, ...collectDescendantIds(menuTree.value, detail.id)]);
    Object.assign(formModel, detail);
    dialogVisible.value = true;
  };

  const handleDelete = async (row) => {
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
  };

  const submitMenu = async (formData) => {
    const payload = buildMenuPayload(formData);

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
  };

  watch(
    [searchKeyword, () => filterState.isEnabled, () => filterState.hidden],
    () => {
      expandedMenuIds.value = new Set(collectBranchExpandableIds(visibleMenus.value, []));
    },
    { flush: 'post' }
  );

  onMounted(() => {
    fetchMenus();
  });

  return {
    loading,
    submitLoading,
    searchKeyword,
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
  };
};
