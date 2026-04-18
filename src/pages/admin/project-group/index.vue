<template>
  <PagePanel>
    <template #header>
      <StatCard label="总项目组数" :value="overViewCardsMap.totalGroups" icon="User" iconColor="var(--primary-havy)"
        iconBg="var(--primary-light)" width="23%"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
      <StatCard label="活跃小组" :value="overViewCardsMap.activeGroups" icon="UserFilled" iconColor="var(--success)"
        iconBg="var(--success-light)" width="23%"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
      <StatCard label="总小组数" :value="overViewCardsMap.totalMembers" icon="Users" iconColor="var(--warning)"
        iconBg="var(--warning-light)" width="23%"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
      <StatCard label="平均小组大小" :value="overViewCardsMap.avgGroupSize" icon="Management" iconColor="var(--info)"
        iconBg="var(--info-light)" width="23%" style="display: inline-block; min-width: 180px;" />

    </template>
    <template #main-table>
      <SearchInput size="middle" placeholder="搜索项目小组名称..." @search="handleSearch" @add="handleAdd">
      </SearchInput>

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
import StatCard from '@/components/common/data/StatCard.vue';
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
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
