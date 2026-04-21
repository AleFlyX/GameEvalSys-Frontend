<template>
  <PagePanel>
    <template #header>
      <StatCard label="评分标准总数" :value="String(totalCount)" icon="DataAnalysis"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
      <StatCard label="已启用标准" :value="String(enabledCount)" icon="Document"
        style="display: inline-block; min-width: 180px;" />
    </template>

    <template #main-table>
      <SearchInput size="middle" @add="handleAdd" @search="handleSearch"></SearchInput>
      <el-table :data="tableData" stripe style="width: 100%; margin-top: 16px;" v-loading="loading">
        <DataTableColums :col-rules="COLUMN_RULES" :ellipsis="true"></DataTableColums>
        <el-table-column label="指标数" width="100">
          <template #default="scope">
            {{ getDisplayIndicators(scope.row).length }}
          </template>
        </el-table-column>
        <el-table-column label="指标详情" min-width="300">
          <template #default="scope">
            <div class="indicators-preview">
              <el-tag v-for="(indicator, index) in getDisplayIndicators(scope.row).slice(0, 3)" :key="index"
                style="margin-right: 8px; margin-bottom: 4px;">
                {{ indicator.name }}
              </el-tag>
              <el-tag v-if="getDisplayIndicators(scope.row).length > 3" type="info">
                +{{ getDisplayIndicators(scope.row).length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <!-- <el-button size="small" type="danger" @click="handleDelete(scope.row)">
              删除
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <div v-if="tableData.length === 0 && !loading" class="empty-state">
        <p>暂无打分标准，请创建新的打分标准</p>
      </div>
    </template>
    <template #footer>
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="defaultPageSizes"
        :total="total" :disabled="disabled" layout="sizes, prev, pager, next" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </template>
    <template #modals>
      <ScoringStdOperation v-model:visible="showOperationDialog" :add-mode="createMode" :initData="detailDialogInitData"
        :edit-mode="editMode" :standard-id="selectedStandardId" @refresh="handleRefresh">
      </ScoringStdOperation>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

import PagePanel from '@/layouts/PagePanel.vue';
import StatCard from '@/components/common/data/StatCard.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import ScoringStdOperation from './components/ScoringStdOperation.vue';

import { ScoringApi } from '@/api/scoring';
import { COLUMN_RULES } from './config/scoringStdColumnRule';
import { useElPagination } from '@/composables/useElPagination';
import { useLoading } from '@/composables/useLoading';
import { getIndicatorsFromStandard } from '@/utils/scoringStandard';

const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('scoringStd:list');
const {
  currentPage,
  pageSize,
  defaultPageSizes,
  total,
  disabled,
  setTotal,
  handleSizeChange,
  handleCurrentChange
} = useElPagination({
  initialPage: 1,
  initialPageSize: 10,
  defaultPageSizes: [10, 20, 50],
  maxPageSize: 100,
  debounceTime: 200,
  onPageChange: async (page, size) => {
    await fetchScoringStandards({ page, size })
  }
});
const tableData = ref([]);
const totalCount = ref(0);
const enabledCount = ref(0);

const showOperationDialog = ref(false);
const createMode = ref(false);
const editMode = ref(false);
const selectedStandardId = ref(null);

const searchKeywords = ref('')
const handleSearch = async (keywords) => {
  searchKeywords.value = keywords;
  await fetchScoringStandards();

}

const getDisplayIndicators = (standard) => getIndicatorsFromStandard(standard);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toEnabled = (value) => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'enabled') return true;
    if (normalized === 'disabled') return false;
  }
  return null;
};

const applyOverview = ({ totalStandards = 0, enabledStandards = 0 }) => {
  totalCount.value = Math.max(0, toNumber(totalStandards));
  enabledCount.value = Math.max(0, toNumber(enabledStandards));
};

const fetchAllStandardsForOverview = async () => {
  const pageSizeForOverview = 200;
  const firstResponse = await ScoringApi.getScoringStandardsList({ page: 1, size: pageSizeForOverview });
  const firstData = firstResponse?.data || {};
  const firstList = firstData.list || [];
  const total = toNumber(firstData.total);

  const allList = [...firstList];
  const totalPages = Math.max(1, Math.ceil(total / pageSizeForOverview));
  for (let page = 2; page <= totalPages; page += 1) {
    const pageResponse = await ScoringApi.getScoringStandardsList({ page, size: pageSizeForOverview });
    allList.push(...(pageResponse?.data?.list || []));
  }

  return {
    list: allList,
    total
  };
};

const loadOverview = async () => {
  try {
    const response = await ScoringApi.getScoringStandardsOverview();
    const data = response?.data;
    if (data) {
      applyOverview({
        totalStandards: data.totalStandards ?? data.total,
        enabledStandards: data.enabledStandards ?? data.activeStandards
      });
      return;
    }
  } catch {
    // overview 接口未就绪时回退列表聚合
  }

  try {
    const { list, total } = await fetchAllStandardsForOverview();
    const enabledFlags = list.map((item) => toEnabled(item?.isEnabled));
    const hasEnabledFlag = enabledFlags.some((flag) => flag !== null);
    const enabledTotal = hasEnabledFlag
      ? enabledFlags.filter((flag) => flag === true).length
      : total;

    applyOverview({
      totalStandards: total,
      enabledStandards: enabledTotal
    });
  } catch (error) {
    console.error('Failed to load scoring standards overview:', error);
  }
};

// 请求参数构建
const buildQueryParams = (pageParams = { page: 1, size: 20 }) => {
  return {
    ...pageParams,
    keyWords: searchKeywords.value || undefined
  }
}

// 加载打分标准列表
const fetchScoringStandards = async (params = { page: 1, size: 10 }) => {
  startLoading();
  try {
    const response = await ScoringApi.getScoringStandardsList(buildQueryParams(params));
    console.log('STDS ', response)
    tableData.value = response.data.list || [];
    console.log(tableData.value)
    setTotal(response.data.total);

    console.log('打分标准列表:', tableData.value);
  } catch (err) {
    ElMessage.error(`加载打分标准列表失败: ${err.message || err}`);
  } finally {
    endLoading();
  }
};

const detailDialogInitData = ref({});

const resetModalState = () => {
  createMode.value = false;
  editMode.value = false;
  detailDialogInitData.value = { name: '', categories: [] };
  selectedStandardId.value = null;
};

// 新增打分标准
const handleAdd = () => {
  resetModalState();
  createMode.value = true;
  showOperationDialog.value = true;
};

// 查看详情
const handleView = (row) => {
  resetModalState();
  console.log('VIEWING ', row)
  detailDialogInitData.value = row;
  showOperationDialog.value = true;
  nextTick(() => {
    selectedStandardId.value = row.id;
  });
};

const handleEdit = (row) => {
  resetModalState();
  editMode.value = true;
  detailDialogInitData.value = row;
  showOperationDialog.value = true;
  nextTick(() => {
    selectedStandardId.value = row.id;
  });
};

// 删除打分标准
// const handleDelete = (row) => {
//   ElMessageBox.confirm(`确定要删除该打分标准吗？删除后将无法恢复。`, '提示', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   })
//     .then(async () => {
//       try {
//         // TODO: 调用删除API（目前API文档中未提供删除接口，可根据实际情况调整）
//         ElMessage.success('打分标准已删除');
//         await fetchScoringStandards();
//       } catch (err) {
//         ElMessage.error(`删除失败: ${err.message || err}`);
//       }
//     })
//     .catch(() => {
//       // 用户取消
//     });
// };


// 刷新列表
const handleRefresh = async () => {
  detailDialogInitData.value = {}
  setTimeout(async () => {
    await Promise.all([
      fetchScoringStandards({ page: currentPage.value, size: pageSize.value }),
      loadOverview()
    ])
  }, 500)
};

onMounted(() => {
  Promise.all([
    fetchScoringStandards(),
    loadOverview()
  ]);
});
</script>

<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.indicators-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}
</style>
