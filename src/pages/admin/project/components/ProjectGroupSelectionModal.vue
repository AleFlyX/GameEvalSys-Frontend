<template>
  <BaseFormModal :visible="visible" width="78%" min-height="72%" :allow-mask-close="false"
    @update:visible="handleVisibleChange">
    <template #title>
      选择项目内受评分的小组
    </template>

    <template #form>
      <div class="group-selection-modal">
        <div class="toolbar">
          <div class="search-row">
            <el-input v-model="searchKeyword" placeholder="搜索小组名称" clearable style="width: 280px"
              @input="handleSearch">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>

          <div class="batch-row">
            <span class="selection-summary">已选 {{ selectedIdsDraft.length }} 个小组</span>
            <el-button size="small" type="primary" :disabled="tableData.length === 0" @click="handleSelectAllCurrentPage">
              全选本页
            </el-button>
            <el-button size="small" type="primary" plain :loading="selectAllLoading" :disabled="total === 0"
              @click="handleSelectAllByFilter">
              全选搜索结果
            </el-button>
            <el-button size="small" :disabled="currentPageSelectedRows.length === 0" @click="handleClearCurrentPage">
              清空本页
            </el-button>
            <el-button size="small" :disabled="tableData.length === 0" @click="handleInvertCurrentPage">
              反选本页
            </el-button>
            <el-button size="small" :disabled="selectedIdsDraft.length === 0" @click="handleClearAllSelection">
              清空全部
            </el-button>
          </div>
        </div>

        <div class="selected-preview" v-if="selectedGroupsDraft.length">
          <span class="preview-label">已选小组：</span>
          <div class="tag-list">
            <el-tag v-for="group in selectedGroupsDraft" :key="group.id" closable @close="removeSelectedGroup(group.id)">
              {{ group.name }}
            </el-tag>
          </div>
        </div>

        <div class="table-container">
          <el-table ref="tableRef" v-loading="loading" :data="tableData" row-key="id" stripe style="width: 100%"
            :reserve-selection="true" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="id" label="小组ID" min-width="100" />
            <el-table-column prop="name" label="小组名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" min-width="180" show-overflow-tooltip />
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
            :total="total" layout="sizes, prev, pager, next" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </template>

    <template #operations>
      <button class="primary-btn" @click="handleConfirm">确认选择</button>
      <button class="cancel-btn" @click="handleVisibleChange(false)">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import { projectGroupApi } from '@/api/project-group';
import { useMessage } from '@/composables/useMessage';
import { useElPagination } from '@/composables/useElPagination';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  selectedGroups: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'confirm']);

const message = useMessage();
const tableRef = ref(null);
const tableData = ref([]);
const searchKeyword = ref('');
const selectedIdsDraft = ref([]);
const selectedGroupsMap = ref(new Map());
const currentPageSelectedRows = ref([]);
const requestPending = ref(false);
const isRestoringSelection = ref(false);
const selectAllLoading = ref(false);

const selectedGroupsDraft = computed(() => {
  const orderedGroups = [];
  selectedIdsDraft.value.forEach((id) => {
    const group = selectedGroupsMap.value.get(id);
    if (group) {
      orderedGroups.push(group);
    }
  });
  return orderedGroups;
});

const syncDraftFromProps = () => {
  selectedIdsDraft.value = [...props.selectedIds];
  selectedGroupsMap.value = new Map();

  props.selectedGroups.forEach((group) => {
    if (group?.id !== undefined) {
      selectedGroupsMap.value.set(group.id, group);
    }
  });
};

const {
  currentPage,
  pageSize,
  total,
  loading,
  handleSizeChange,
  handleCurrentChange,
  setTotal
} = useElPagination({
  initialPage: 1,
  initialPageSize: 10,
  defaultPageSizes: [10, 20, 30, 50],
  maxPageSize: 100,
  debounceTime: 200,
  onPageChange: async (page, size) => {
    await fetchGroupList({ page, size });
  }
});

const fetchGroupList = async (pageParams = { page: 1, size: 10 }) => {
  if (requestPending.value) {
    return;
  }

  requestPending.value = true;
  try {
    const response = await projectGroupApi.getGroupList({
      page: pageParams.page,
      size: pageParams.size,
      keyWords: searchKeyword.value.trim() || undefined
    });

    const list = response.data?.list || [];
    tableData.value = list;
    setTotal(Number(response.data?.total || 0));

    list.forEach((group) => {
      selectedGroupsMap.value.set(group.id, group);
    });

    await restoreSelectionState();
  } catch (error) {
    message.error('获取项目小组列表失败');
    console.error('Error fetching project groups:', error);
  } finally {
    requestPending.value = false;
  }
};

const restoreSelectionState = async () => {
  await nextTick();
  if (!tableRef.value) {
    return;
  }

  isRestoringSelection.value = true;
  try {
    tableRef.value.clearSelection?.();
    const selectedIdSet = new Set(selectedIdsDraft.value);
    const rowsToSelect = tableData.value.filter(row => selectedIdSet.has(row.id));
    rowsToSelect.forEach((row) => {
      tableRef.value.toggleRowSelection?.(row, true);
    });
    currentPageSelectedRows.value = rowsToSelect;
  } finally {
    isRestoringSelection.value = false;
  }
};

const handleSelectionChange = (rows) => {
  currentPageSelectedRows.value = rows;

  if (isRestoringSelection.value) {
    return;
  }

  const currentPageIds = new Set(tableData.value.map(row => row.id));
  const currentSelectedIds = new Set(rows.map(row => row.id));
  const otherPageIds = selectedIdsDraft.value.filter(id => !currentPageIds.has(id));

  rows.forEach((row) => {
    selectedGroupsMap.value.set(row.id, row);
  });

  selectedIdsDraft.value = [...otherPageIds, ...currentSelectedIds];
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchGroupList({ page: 1, size: pageSize.value });
};

const handleSelectAllCurrentPage = () => {
  tableData.value.forEach((row) => {
    tableRef.value?.toggleRowSelection?.(row, true);
  });
};

const handleSelectAllByFilter = async () => {
  if (selectAllLoading.value || total.value === 0) {
    return;
  }

  selectAllLoading.value = true;
  try {
    const response = await projectGroupApi.getGroupList({
      page: 1,
      size: total.value,
      keyWords: searchKeyword.value.trim() || undefined
    });

    const list = response.data?.list || [];
    list.forEach((group) => {
      selectedGroupsMap.value.set(group.id, group);
    });
    selectedIdsDraft.value = [...new Set([...selectedIdsDraft.value, ...list.map(group => group.id)])];
    await restoreSelectionState();
  } catch (error) {
    message.error('全选搜索结果失败');
    console.error('Error selecting all filtered groups:', error);
  } finally {
    selectAllLoading.value = false;
  }
};

const handleClearCurrentPage = () => {
  tableData.value.forEach((row) => {
    tableRef.value?.toggleRowSelection?.(row, false);
  });
};

const handleInvertCurrentPage = async () => {
  await nextTick();
  const selectedIdSet = new Set(currentPageSelectedRows.value.map(row => row.id));
  tableData.value.forEach((row) => {
    tableRef.value?.toggleRowSelection?.(row, !selectedIdSet.has(row.id));
  });
};

const handleClearAllSelection = async () => {
  selectedIdsDraft.value = [];
  currentPageSelectedRows.value = [];
  await restoreSelectionState();
};

const removeSelectedGroup = async (groupId) => {
  selectedIdsDraft.value = selectedIdsDraft.value.filter(id => id !== groupId);
  await restoreSelectionState();
};

const handleConfirm = () => {
  emit('confirm', {
    ids: [...selectedIdsDraft.value],
    groups: selectedGroupsDraft.value
  });
  emit('update:visible', false);
};

const handleVisibleChange = (value) => {
  emit('update:visible', value);
};

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) {
      return;
    }

    syncDraftFromProps();
    if (currentPage.value !== 1) {
      currentPage.value = 1;
    }
    await fetchGroupList({ page: 1, size: pageSize.value });
  }
);

watch(
  () => [props.selectedIds, props.selectedGroups],
  () => {
    if (!props.visible) {
      syncDraftFromProps();
    }
  },
  { deep: true }
);
</script>

<style scoped>
.group-selection-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  flex-wrap: wrap;
}

.search-row,
.batch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.selection-summary {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.selected-preview {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.preview-label {
  color: var(--el-text-color-regular);
  line-height: 32px;
  white-space: nowrap;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-container {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: auto;
  min-height: 280px;
  max-height: 52vh;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}
</style>
