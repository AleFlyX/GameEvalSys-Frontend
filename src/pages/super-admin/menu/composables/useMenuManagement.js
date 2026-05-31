import { computed, onMounted, reactive, ref, watch } from 'vue';

import { menuApi } from '@/api/menu';
import { useClipboard } from '@/composables/useClipboard';
import { useMessage } from '@/composables/useMessage';
import { showMsgBox } from '@/utils/ConfirmBox';
import {
  createDefaultMenuFormModel,
  menuTypeLabelMap,
  menuTypeTagMap,
  roleLabelMap,
  roleOptions,
} from '@/domain/menu/menuConstants';
import {
  cloneMenuTree,
  normalizeMenuRecord,
  normalizeMenuType,
  normalizeRoleCodes,
} from '@/domain/menu/menuNormalizer';
import {
  applyKeywordFilter,
  applyStatusFilter,
  collectBranchExpandableIds,
  collectDescendantIds,
  flattenMenus,
  flattenRenderedMenus,
} from '@/domain/menu/menuTree';
import {
  buildMenuPayload,
  buildMenuSql,
  extractSavedMenuSqlMeta,
  extractSqlMeta,
  extractSqlText,
} from '@/domain/menu/menuSql';
import {
  buildDeleteMenuPrompt,
  buildMenuDebugInfo,
  buildMenuStats,
  buildMenuSubmitMessage,
  buildSaveMenuSqlMetaItems,
  extractMenuTreeResponse,
} from '@/domain/menu/menuView';

export const useMenuManagement = () => {
  const message = useMessage();
  const { copy } = useClipboard();
  const loading = ref(false);
  const submitLoading = ref(false);
  const allMenuSqlVisible = ref(false);
  const allMenuSqlLoading = ref(false);
  const allMenuSqlText = ref('');
  const allMenuSqlMeta = reactive({
    menuCount: 0,
    generatedAt: '',
  });
  const saveMenuSqlVisible = ref(false);
  const saveMenuSqlText = ref('');
  const saveMenuSqlMeta = reactive({
    menuId: '',
    menuCode: '',
  });
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

  const formModel = reactive(createDefaultMenuFormModel());
  const sqlPreview = computed(() => buildMenuSql(formModel, normalizeMenuType).fullSql);
  const saveMenuSqlMetaItems = computed(() => buildSaveMenuSqlMetaItems(saveMenuSqlMeta));

  const resetForm = () => {
    Object.assign(formModel, createDefaultMenuFormModel());
    blockedParentIds.value = new Set();
    editingId.value = null;
  };

  const visibleMenus = computed(() => {
    const filteredByStatus = applyStatusFilter(menuTree.value, filterState);
    return applyKeywordFilter(filteredByStatus, searchKeyword.value);
  });

  const renderedMenus = computed(() => flattenRenderedMenus(visibleMenus.value, expandedMenuIds.value, 0, []));

  const menuDebugInfo = computed(() => buildMenuDebugInfo({
    menuTree: menuTree.value,
    visibleMenus: visibleMenus.value,
    renderedMenus: renderedMenus.value,
    blockedParentIds: blockedParentIds.value,
    expandedMenuIds: expandedMenuIds.value,
  }));

  const menuStats = computed(() => buildMenuStats(visibleMenus.value));

  const parentOptions = computed(() => flattenMenus(menuTree.value, 0, [], blockedParentIds.value));
  const isEditing = computed(() => editingId.value !== null);
  const dialogTitle = computed(() => (isEditing.value ? '编辑菜单' : '新增菜单'));

  const fetchMenus = async () => {
    loading.value = true;
    try {
      const response = await menuApi.getMenuTree();
      const list = extractMenuTreeResponse(response);
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

  const loadAllMenuSql = async () => {
    allMenuSqlVisible.value = true;
    allMenuSqlLoading.value = true;

    try {
      const response = await menuApi.getMenuSql();
      allMenuSqlText.value = extractSqlText(response);
      Object.assign(allMenuSqlMeta, extractSqlMeta(response));
    } catch (error) {
      allMenuSqlText.value = '';
      Object.assign(allMenuSqlMeta, {
        menuCount: 0,
        generatedAt: '',
      });
      message.error('获取全部菜单 SQL 失败');
      console.error('Failed to load menu SQL:', error);
    } finally {
      allMenuSqlLoading.value = false;
    }
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

    const { title: dialogTitle, content } = buildDeleteMenuPrompt(row);
    try {
      await showMsgBox(dialogTitle, content, { type: 'danger', confirmButtonText: '确认删除', cancelButtonText: '取消' });
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
    const payload = buildMenuPayload(formData, normalizeMenuType);

    submitLoading.value = true;
    try {
      const response = isEditing.value
        ? await menuApi.updateMenu(editingId.value, payload)
        : await menuApi.createMenu(payload);

      const sqlText = extractSqlText(response);
      if (sqlText) {
        saveMenuSqlText.value = sqlText;
        Object.assign(saveMenuSqlMeta, extractSavedMenuSqlMeta(response, payload));
        saveMenuSqlVisible.value = true;
      }

      message.success(buildMenuSubmitMessage({ isEditing: isEditing.value, hasSql: Boolean(sqlText) }));

      dialogVisible.value = false;
      await fetchMenus();
    } catch (error) {
      message.error(isEditing.value ? '更新菜单失败' : '创建菜单失败');
      console.error('Failed to submit menu:', error);
    } finally {
      submitLoading.value = false;
    }
  };

  const copySqlPreview = async () => {
    return copy(sqlPreview.value, {
      emptyMessage: '当前没有可复制的 SQL',
      successMessage: 'SQL 已复制',
    });
  };

  const copyAllMenuSql = async () => {
    return copy(allMenuSqlText.value, {
      emptyMessage: '当前没有可复制的菜单 SQL',
      successMessage: '全部菜单 SQL 已复制',
    });
  };

  const copySaveMenuSql = async () => {
    return copy(saveMenuSqlText.value, {
      emptyMessage: '当前没有可复制的保存 SQL',
      successMessage: '保存 SQL 已复制',
    });
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
    allMenuSqlVisible,
    allMenuSqlLoading,
    allMenuSqlText,
    allMenuSqlMeta,
    saveMenuSqlVisible,
    saveMenuSqlText,
    saveMenuSqlMeta,
    saveMenuSqlMetaItems,
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
    sqlPreview,
    normalizeRoleCodes,
    handleSearch,
    handleRefresh,
    loadAllMenuSql,
    isMenuBranchExpanded,
    toggleMenuBranch,
    openCreateDialog,
    openCreateChildDialog,
    openEditDialog,
    handleDelete,
    submitMenu,
    copySqlPreview,
    copyAllMenuSql,
    copySaveMenuSql,
  };
};
