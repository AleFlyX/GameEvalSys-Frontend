<template>
  <PagePanel>
    <template #header>
      <OverviewCard icon="Document" title="总项目数" :data="overViewCardsMap.totalProjects" icon-color="var(--primary-havy)"
        icon-background="var(--primary-light)">
      </OverviewCard>
      <OverviewCard icon="Clock" title="进行中的项目" :data="overViewCardsMap.ongoingProjects" icon-color="var(--warning)"
        icon-background="var(--warning-light)">
      </OverviewCard>
      <OverviewCard icon="Checked" title="已完成打分" :data="overViewCardsMap.completedProjects" icon-color="var(--success)"
        icon-background="var(--success-light)">
      </OverviewCard>
      <OverviewCard icon="Failed" title="待完成打分" :data="overViewCardsMap.pendingProjects" icon-color="var(--danger)"
        icon-background="var(--danger-light)">
      </OverviewCard>
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
import { reactive } from 'vue';

import PagePanel from '@/layouts/PagePanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
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
  // handleRefresh,
} = useScoringList()

const {
  selectedProject,
  showProjectDetailDialog,
  loadingTable,
  handleStartScoring,
  handleViewDetail
} = useHandleInteract();

// 统计数据
const overViewCardsMap = reactive({
  totalProjects: '0',
  ongoingProjects: '0',
  completedProjects: '0',
  pendingProjects: '0'
});
// const searchKeyword = ref('');

// 计算统计数据
// const calculateStats = () => {
//   if (!scoringList.value || scoringList.value.length === 0) {
//     overViewCardsMap.totalProjects = '0';
//     overViewCardsMap.ongoingProjects = '0';
//     overViewCardsMap.completedProjects = '0';
//     overViewCardsMap.pendingProjects = '0';
//     return;
//   }

//   let ongoing = 0;
//   let completed = 0;

//   scoringList.value.forEach(project => {
//     if (project.status === 'ongoing') {
//       ongoing++;
//     } else if (project.status === 'ended') {
//       completed++;
//     }
//   });

//   overViewCardsMap.totalProjects = String(totalData.value);
//   overViewCardsMap.ongoingProjects = String(ongoing);
//   overViewCardsMap.completedProjects = String(completed);
//   overViewCardsMap.pendingProjects = String(Math.max(0, totalData.value - completed));
// };

// 搜索处理
// const handleSearch = (keyword) => {
//   searchKeyword.value = keyword;
//   pageParams.page = 1;

// };

</script>

<style scoped></style>
