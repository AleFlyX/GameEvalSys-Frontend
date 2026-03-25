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
      <div class="search-bar" style="width: 100%; display: flex;align-items: center;justify-content: center;">
        <SearchInput size="middle" placeholder="搜索项目名称..." @search="handleSearch" :show-add-btn="false"></SearchInput>
      </div>

      <el-table :data="scoringList" stripe style="width: 100%">
        <DataTableColums :col-rules="columnsRules"></DataTableColums>
        <el-table-column>
          <template #header>
            <div style="display: flex; justify-content: start;">
              操作
            </div>
          </template>
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleStartScoring(scope.row)">
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
      <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
        :page-sizes="[10, 20, 30]" size="middle" :disabled="paginationDisabled" :total="totalData"
        @size-change="handleSizeChange" layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
    </template>
    <template #modals>
      <ProjectGroupDetails v-model:visible="showProjectDetailDialog" :selected-group="selectedProject">
      </ProjectGroupDetails>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

import OverviewCard from '@/components/common/data/OverviewCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';

import { useUserStore } from '@/stores/modules/userStore';
import { projectApi } from '@/api/project';
import { ElMessage } from 'element-plus';
import PagePanel from '@/layouts/PagePanel.vue';
import { columnsRules } from './utils/projectListColRules';//数据表格列定义
import MyBtn from '@/components/common/form/MyBtn.vue';

const userStore = useUserStore()
// 统计数据
const overViewCardsMap = reactive({
  totalProjects: '0',
  ongoingProjects: '0',
  completedProjects: '0',
  pendingProjects: '0'
});

// 分页参数
const pageParams = reactive({
  page: 1,
  size: 10,
});

const totalData = ref(0);
const paginationDisabled = ref(false);
const scoringList = ref([]); //table 数据
const selectedProject = ref(null);
const showProjectDetailDialog = ref(false);
const searchKeyword = ref('');

// 获取打分项目列表
const fetchScoringProjects = async () => {
  try {
    paginationDisabled.value = true;
    const response = await projectApi.getAuthorizedProjectList(userStore.userInfo.id)
    // console.log(response.data)
    // const response = await projectApi.getProjectList({
    //   page: pageParams.page,
    //   size: pageParams.size,
    //   isEnabled: true
    // });

    if (response.code === 200 && response.data) {
      scoringList.value = response.data || [];
      totalData.value = response.data.total || 0;

      // 计算统计数据
      calculateStats();
    }
  } catch (error) {
    ElMessage.error('获取项目列表失败: ' + error);
    console.error('Error fetching projects:', error);
  } finally {
    paginationDisabled.value = false;
  }
};

// 计算统计数据
const calculateStats = () => {
  if (!scoringList.value || scoringList.value.length === 0) {
    overViewCardsMap.totalProjects = '0';
    overViewCardsMap.ongoingProjects = '0';
    overViewCardsMap.completedProjects = '0';
    overViewCardsMap.pendingProjects = '0';
    return;
  }

  let ongoing = 0;
  let completed = 0;

  scoringList.value.forEach(project => {
    if (project.status === 'ongoing') {
      ongoing++;
    } else if (project.status === 'ended') {
      completed++;
    }
  });

  overViewCardsMap.totalProjects = String(totalData.value);
  overViewCardsMap.ongoingProjects = String(ongoing);
  overViewCardsMap.completedProjects = String(completed);
  overViewCardsMap.pendingProjects = String(Math.max(0, totalData.value - completed));
};

// 搜索处理
const handleSearch = (keyword) => {
  searchKeyword.value = keyword;
  pageParams.page = 1;
  fetchScoringProjects();
};

// 添加项目（管理员功能）
const handleAdd = () => {
  ElMessage.info('管理员可在项目管理页面添加项目');
};

const router = useRouter();

// 开始打分
const handleStartScoring = (row) => {
  selectedProject.value = row;
  // showGroupScoringDialog.value = true;
  router.push({
    name: 'projectScoring',
    params: {
      projectId: row.id,
    },
    query: {
      projectName: row.name,
    } // 自定义字段用query
  })

};

// 查看项目详情
const handleViewDetail = (row) => {
  selectedProject.value = row;
  console.log(row)
  showProjectDetailDialog.value = true;
};

// 分页处理
const handleSizeChange = (newSize) => {
  pageParams.size = newSize;
  pageParams.page = 1;
  fetchScoringProjects();
};

const handleCurrentChange = (newPage) => {
  pageParams.page = newPage;
  fetchScoringProjects();
};

// 刷新列表
const handleRefresh = () => {
  fetchScoringProjects();
};

// 状态格式化
const formatStatus = (status) => {
  const statusMap = {
    'not_started': '未开始',
    'ongoing': '进行中',
    'ended': '已截止'
  };
  return statusMap[status] || status;
};

const getStatusTagType = (status) => {
  const typeMap = {
    'not_started': 'info',
    'ongoing': 'warning',
    'ended': 'danger'
  };
  return typeMap[status] || 'info';
};

// 初始化
onMounted(() => {
  fetchScoringProjects();
});
</script>

<style scoped>
.scoring-list {
  padding: 20px;
}

.stats-container {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stats-container>div {
  flex: 1;
  min-width: 200px;
}

.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.project-detail {
  padding: 20px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

.detail-item label {
  font-weight: 600;
  min-width: 100px;
  margin-right: 20px;
}

.detail-item span {
  flex: 1;
  color: #606266;
}
</style>
