<template>
  <SelectionModalShell :visible="visible" width="78%" min-height="72%" :allow-mask-close="false"
    @update:visible="handleVisibleChange">
    <template #title>
      <div class="dialog-title-wrap">
        <h3>选择项目内受评分的小组</h3>
        <p>支持按名称搜索、批量选择和已选内容回收</p>
      </div>
    </template>

    <template #summary>
      <div class="summary-item">
        <span>已选小组</span>
        <strong>{{ selectedIdsDraft.length }}</strong>
      </div>
      <div class="summary-item">
        <span>当前页已选</span>
        <strong>{{ currentPageSelectedRows.length }}</strong>
      </div>
      <div class="summary-item">
        <span>搜索结果</span>
        <strong>{{ total }}</strong>
      </div>
    </template>

    <template #toolbar>
      <div class="toolbar-grid">
        <div class="toolbar-card">
          <div class="toolbar-label">搜索</div>
          <el-input v-model="searchKeyword" placeholder="搜索小组名称" clearable class="search-input" @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="toolbar-card toolbar-card--actions">
          <div class="toolbar-label">批量操作</div>
          <div class="batch-row">
            <el-button size="small" type="primary" :disabled="tableData.length === 0"
              @click="handleSelectAllCurrentPage">
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
      </div>
    </template>

    <template #preview>
      <div class="selected-preview" v-if="selectedGroupsDraft.length">
        <span class="preview-label">已选小组：</span>
        <div class="tag-list">
          <el-tag v-for="group in selectedGroupsDraft" :key="group.id" closable @close="removeSelectedGroup(group.id)">
            {{ group.name }}
          </el-tag>
        </div>
      </div>
    </template>

    <template #table>
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
    </template>

    <template #pagination>
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
          :total="total" layout="sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </template>

    <template #operations>
      <MyBtn type="primary"  @click="handleConfirm">确认选择</MyBtn>
      <MyBtn type="default"  @click="handleVisibleChange(false)">取消</MyBtn>
    </template>
  </SelectionModalShell>
</template>

<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import { computed, nextTick, ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { projectGroupApi } from '@/api/project-group';
import { useMessage } from '@/composables/useMessage';
import { useElPagination } from '@/composables/useElPagination';
import SelectionModalShell from '@/components/common/modal/SelectionModalShell.vue';

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
.dialog-title-wrap h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--text);
}

.dialog-title-wrap p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.group-selection-modal {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.selection-summary-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(47, 107, 255, 0.08), rgba(32, 183, 199, 0.08));
  border: 1px solid rgba(47, 107, 255, 0.12);
  border-radius: 16px;
}

html[data-theme="dark"] .selection-summary-panel {
  background: linear-gradient(135deg, rgba(47, 107, 255, 0.16), rgba(32, 183, 199, 0.16));
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.summary-item span {
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.summary-item strong {
  color: var(--text);
  font-size: 18px;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(0, 2fr);
  gap: 12px;
}

.toolbar-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.toolbar-card--actions {
  min-width: 0;
}

.toolbar-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.search-input {
  width: 100%;
}

.batch-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.selected-preview {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card-bg);
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
  border: 1px solid #e5ebf3;
  border-radius: 16px;
  overflow: auto;
  min-height: 280px;
  max-height: 52vh;
  background: #fff;
  box-shadow: 0 12px 24px rgba(31, 42, 68, 0.06);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dialog-title-wrap h3 {
    font-size: 20px;
  }

  .batch-row {
    width: 100%;
  }
}
</style>
