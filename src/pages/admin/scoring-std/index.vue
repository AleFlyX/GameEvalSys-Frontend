<template>
  <PagePanel>
    <template #header>
      <OverviewCard icon="DataAnalysis" title="评分标准总数" :data="String(totalCount)"></OverviewCard>
      <OverviewCard icon="Document" title="已启用标准" :data="String(enabledCount)"></OverviewCard>
    </template>

    <template #main-table>
      <SearchInput size="middle" @add="handleAdd"></SearchInput>
      <el-table :data="tableData" stripe style="width: 100%; margin-top: 16px;" v-loading="loading">
        <DataTableColums :col-rules="COLUMN_RULES"></DataTableColums>
        <el-table-column label="指标数" width="100">
          <template #default="scope">
            {{ scope.row.indicators?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="指标详情" min-width="300">
          <template #default="scope">
            <div class="indicators-preview">
              <el-tag v-for="(indicator, index) in (scope.row.indicators || []).slice(0, 3)" :key="index"
                style="margin-right: 8px; margin-bottom: 4px;">
                {{ indicator.name }}
              </el-tag>
              <el-tag v-if="(scope.row.indicators || []).length > 3" type="info">
                +{{ (scope.row.indicators || []).length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleView(scope.row)">
              查看
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

    <template #modals>
      <ScoringStdOperation v-model:visible="showOperationDialog" :add-mode="createMode"
        :standard-id="selectedStandardId" @refresh="handleRefresh">
      </ScoringStdOperation>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

import PagePanel from '@/layouts/PagePanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';

import ScoringStdOperation from './components/ScoringStdOperation.vue';

import { ScoringApi } from '@/api/scoring';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import { COLUMN_RULES } from './config/scoringStdColumnRule';
import { useLoading } from '@/composables/useLodaing';

const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('scoringStd:list');
const tableData = ref([]);
const totalCount = ref(0);
const enabledCount = ref(0);

const showOperationDialog = ref(false);
const createMode = ref(false);
const selectedStandardId = ref(null);

// 加载打分标准列表
const fetchScoringStandards = async () => {
  startLoading();
  try {
    const response = await ScoringApi.getScoringStandardsList();
    console.log('STDS ', response.data)
    tableData.value = response.data || [];
    totalCount.value = tableData.value.length;
    enabledCount.value = tableData.value.length; // 默认全部启用

    console.log('打分标准列表:', tableData.value);
  } catch (err) {
    ElMessage.error(`加载打分标准列表失败: ${err.message || err}`);
  } finally {
    endLoading();
  }
};

// 新增打分标准
const handleAdd = () => {
  createMode.value = true;
  selectedStandardId.value = null;
  showOperationDialog.value = true;

};

// 查看详情
const handleView = (row) => {
  createMode.value = false;
  selectedStandardId.value = row.id;
  showOperationDialog.value = true;
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
  await fetchScoringStandards();
};

onMounted(() => {
  fetchScoringStandards();
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
