<template>
  <PagePanel>
    <template #header>

      <StatCard label="总评审组数" :value="overViewCardsMap.totalGroups" icon="User" iconColor="var(--primary-havy)"
        iconBg="var(--primary-light)" width="23%"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
      <StatCard label="活跃评审组" :value="overViewCardsMap.activeGroups" icon="UserFilled" iconColor="var(--success)"
        iconBg="var(--success-light)" width="23%"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
      <StatCard label="总成员数" :value="overViewCardsMap.totalMembers" icon="Users" iconColor="var(--warning)"
        iconBg="var(--warning-light)" width="23%"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
      <StatCard label="平均组规模" :value="overViewCardsMap.avgGroupSize" icon="Management" iconColor="var(--info)"
        iconBg="var(--info-light)" width="23%" style="display: inline-block; min-width: 180px;" />

    </template>
    <template #main-table>
      <SearchInput size="middle" placeholder="搜索评审组名称..." @search="handleSearch" @add="handleAdd">
      </SearchInput>
      <div class="data-table">
        <el-table :data="tableData" stripe style="width: 100%" v-loading="isLoading">
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
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30]"
        size="middle" :disabled="paginationDisabled" :total="totalData" @size-change="handleSizeChange"
        layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
    </template>

    <template #modals>
      <!-- 创建/编辑评审组 -->
      <!-- <ReviewerGroupOperation v-model:visible="showAddDialog" :edit-data="editingData" @refresh="handleRefresh">
      </ReviewerGroupOperation> -->

      <!-- 查看详情 -->
      <ReviererGroupDetails v-model:visible="showDetailDialog" :selected-group="selectedGroup">
      </ReviererGroupDetails>
    </template>
  </PagePanel>
</template>

<script setup>
import PagePanel from '@/layouts/PagePanel.vue';
import StatCard from '@/components/common/data/StatCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import ReviererGroupDetails from './components/ReviererGroupDetails.vue';
// import ReviewerGroupOperation from './components/ReviewerGroupOperation.vue';

import { COLUMN_RULES } from './config/data-table/reviewerGroupList';
import { useReviewerGroupList } from './composables/useReviewerGroupList';
import { useReviewerGroupDialogs } from './composables/useReviewerGroupDialogs';

// 公用列表和分页逻辑
const {
  tableData,
  totalData,
  overViewCardsMap,
  currentPage,
  pageSize,
  paginationDisabled,
  handleSizeChange,
  handleCurrentChange,
  isLoading,
  handleSearch,
  handleRefresh,
} = useReviewerGroupList();

// 对话框和操作逻辑
const {
  // showAddDialog,
  showDetailDialog,
  editingData,
  selectedGroup,
  handleAdd,
  handleEdit,
  handleViewDetail,
  handleChangeStatus,
} = useReviewerGroupDialogs(handleRefresh);
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
