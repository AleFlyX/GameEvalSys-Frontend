<template>
  <PagePanel>
    <template #header>
      <StatCard icon="Document" label="总项目数" :value="scoringOverview.totalProjects" icon-color="var(--primary-havy)"
        icon-bg="var(--primary-light)">
      </StatCard>
      <StatCard icon="Clock" label="进行中的项目" :value="scoringOverview.ongoingProjects" icon-color="var(--warning)"
        icon-bg="var(--warning-light)">
      </StatCard>
      <StatCard icon="Checked" label="已完成打分" :value="scoringOverview.completedProjects" icon-color="var(--success)"
        icon-bg="var(--success-light)">
      </StatCard>
      <StatCard icon="Failed" label="待完成打分" :value="scoringOverview.pendingProjects" icon-color="var(--danger)"
        icon-bg="var(--danger-light)">
      </StatCard>
    </template>

    <template #main-table>
      <!-- <div class="search-bar" style="width: 100%; display: flex;align-items: center;justify-content: center;">
        <SearchInput disabled size="middle" placeholder="搜索项目名称..." @search="handleSearch" :show-add-btn="false">
        </SearchInput>
      </div> -->

      <el-table :data="scoringList" stripe style="width: 100%" v-loading="initLoading || loadingTable">
        <DataTableColums :col-rules="columnsRules"></DataTableColums>
        <el-table-column>
          <template #header>
            <div style="display: flex; justify-content: start;">
              操作
            </div>
          </template>
          <template #default="scope">
            <el-button v-loading="loadingTable" size="small" type="primary" @click="handleStartScoring(scope.row)">
              查看小组
            </el-button>
            <el-button size="small" @click="handleViewDetail(scope.row)">
              项目详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template #footer>
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="defaultPageSizes"
        size="middle" :disabled="disabled" :total="total" @size-change="handleSizeChange"
        layout="sizes, prev, pager,next" @current-change="handleCurrentChange">
      </el-pagination>
    </template>
    <template #modals>
      <ProjectDetails v-model:visible="showProjectDetailDialog" :selected-project="selectedProject">
      </ProjectDetails>
    </template>
  </PagePanel>
</template>

<script setup>
import PagePanel from '@/layouts/PagePanel.vue';
// import SearchInput from '@/components/common/data/SearchInput.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import ProjectDetails from '@/components/business/project/project-detail/index.vue';

// import { useUserStore } from '@/stores/modules/userStore';
import { columnsRules } from '../config/projectListColRules';//数据表格列定义
import { useScoringList } from './composables/useScoringList';
import { useHandleInteract } from './composables/useHandleInteract';

// const userStore = useUserStore()
const {
  currentPage,
  pageSize,
  total,
  disabled,
  defaultPageSizes,
  handleSizeChange,
  handleCurrentChange,
  initLoading,
  // message, //elmessage
  scoringList,  //data table
  scoringOverview,  // 打分概览统计数据
} = useScoringList()

const {
  selectedProject,
  showProjectDetailDialog,
  loadingTable,
  handleStartScoring,
  handleViewDetail
} = useHandleInteract();

// 统计数据通过 scoringOverview 从 API 获取，不需要本地 reactive 对象

</script>

<style scoped></style>
