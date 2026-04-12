<template>
  <PagePanel>
    <template #header>
      <div class="stats-header">
        <OverviewCard icon="User" title="总项目组数" :data="overViewCardsMap.totalGroups" icon-color="var(--primary-havy)"
          icon-background="var(--primary-light)" width="23%">
        </OverviewCard>
        <OverviewCard icon="UserFilled" title="活跃小组" :data="overViewCardsMap.activeGroups" icon-color="var(--success)"
          icon-background="var(--success-light)" width="23%">
        </OverviewCard>
        <OverviewCard icon="Users" title="总小组数" :data="overViewCardsMap.totalMembers" icon-color="var(--warning)"
          icon-background="var(--warning-light)" width="23%">
        </OverviewCard>
        <OverviewCard icon="Management" title="平均小组大小" :data="overViewCardsMap.avgGroupSize" icon-color="var(--info)"
          icon-background="var(--info-light)" width="23%">
        </OverviewCard>
      </div>
    </template>
    <template #main-table>
      <SearchInput size="middle" placeholder="搜索项目小组名称..." @search="handleSearch" @add="handleAdd">
      </SearchInput>
      <div class="data-table">
        <el-table :data="tableData" stripe style="width: 100%">
          <DataTableColums :col-rules="COLUMN_RULES"></DataTableColums>
          <el-table-column label="操作" width="auto" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">查看详情</el-button>
              <el-button v-if="scope.row.isEnabled" size="small" type="danger"
                @click="handleChangeStatus(false, scope.row)">
                禁用
              </el-button>
              <el-button v-else size="small" type="success" @click="handleChangeStatus(true, scope.row)">
                启用
              </el-button>
              <!-- <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <template #footer>
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="defaultPageSizes"
        size="middle" :disabled="disabled" :total="total" @size-change="handleSizeChange"
        layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
    </template>

    <template #modals>
      <ProjectGroupOperation v-model:visible="showOperationDialog" :editMode="isEdit" :data="editingData"
        @refresh="handleRefresh">
      </ProjectGroupOperation>

      <!-- 查看详情 -->
      <ProjectGroupDetails v-model:visible="showDetailDialog" @update:visible="handleClose"
        :selected-group="selectedGroup">
      </ProjectGroupDetails>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';

import PagePanel from '@/layouts/PagePanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import ProjectGroupDetails from '../../../components/business/project-group/ProjectGroupDetails.vue';
import ProjectGroupOperation from './components/ProjectGroupOperation.vue';

import { projectGroupApi } from '@/api/project-group';
import { showMsgBox } from '@/utils/ConfirmBox';
import { COLUMN_RULES } from './config/data-table/projectGroupColRule';
import { useProjectGroupData } from './composables/useProjectGroupData';

const {
  currentPage,
  pageSize,
  total,
  disabled,
  defaultPageSizes,
  overViewCardsMap,
  tableData,
  handleSearch,
  handleRefresh,
  handleSizeChange,
  handleCurrentChange,
  fetchGroupList,
  cancelRequest
} = useProjectGroupData();

// 模态框相关
const showOperationDialog = ref(false);
const showDetailDialog = ref(false);
const isEdit = ref(false);

const editingData = ref(null);
const selectedGroup = ref(null);

// 添加项目小组
const handleAdd = () => {
  isEdit.value = false;
  editingData.value = null;
  showOperationDialog.value = true;
};

// 编辑项目小组
const handleEdit = (row) => {
  editingData.value = row;
  isEdit.value = true;
  showOperationDialog.value = true;
};

// 查看详情
const handleViewDetail = (row) => {
  selectedGroup.value = row;
  showDetailDialog.value = true;
};

const handleClose = (val) => {
  showOperationDialog.value = val;
  showDetailDialog.value = val;
};

// 修改状态
const handleChangeStatus = async (newStatus, row) => {
  try {
    await showMsgBox('确认' + (newStatus ? '启用' : '禁用'));
    await projectGroupApi.editGroup(row.id, { ...row, isEnabled: newStatus ? 1 : 0 });
    ElMessage.success(newStatus ? '启用成功' : '禁用成功');
    await handleRefresh();
  } catch {
    ElMessage.error('操作失败: ');
  }
};

// 初始化
onMounted(async () => {
  try {
    await fetchGroupList({
      page: currentPage.value,
      size: pageSize.value
    });
  } catch (error) {
    console.error('Error fetching group list:', error);
  }
});

onBeforeUnmount(() => {
  cancelRequest();
});
</script>

<style scoped>
.stats-header {
  width: 100%;
  display: flex;
  /* gap: 20px; */
  margin-bottom: 20px;
}

.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
