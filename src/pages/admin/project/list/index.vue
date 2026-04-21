<template>
  <PagePanel>
    <template #header>
      <StatCard v-for="card in overViewCardsMap" :key="card.title" :label="card.title" :value="card.data"
        :icon="card.icon" :iconColor="card.iconColor" :iconBg="card.iconBackground"
        style="margin-right: 16px; display: inline-block; min-width: 180px;" />
    </template>

    <template #main-table>
      <SearchInput size="middle" @search="handleSearch" @add="showAddProjectDialog = true"></SearchInput>
      <el-table :data="projectList" v-loading="loading">
        <DataTableColums :col-rules="PROJECT_LIST_RULES" ellipsis></DataTableColums>
        <el-table-column>
          <template #header>
            <div style="display: flex; justify-content: start;">
              操作
            </div>
          </template>
          <template #default="scope">
            <!-- 删除放到编辑里边 -->
            <el-button size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="primary" @click="handleViewPrDetails(scope.row)">
              查看详细
            </el-button>
            <el-button v-if="!scope.row.isEnabled" size="small" type="primary"
              @click="handleProjectStatus(true, scope.$index, scope.row)">
              启用
            </el-button>
            <el-button v-if="scope.row.isEnabled" size="small" type="danger"
              @click="handleProjectStatus(false, scope.$index, scope.row)">
              停用
            </el-button>
            <!-- <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </template>

    <template #footer>
      <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
        :page-sizes="[10, 20, 30]" size="middle" :disabled="pagenationDisabled" :total="totalData"
        @size-change="handleSizeChange" layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
    </template>

    <template #modals>
      <ProjectConfirm v-model:visible="showDeleteProjectDialog" :data="handlingProjectStatus" @refresh="handleRefresh">
      </ProjectConfirm>
      <ProjectDetails v-model:visible="showDetailDialog" :selected-project="propjectDetail"></ProjectDetails>
      <ProjectAdd v-model:visible="showAddProjectDialog" @refresh="handleRefresh">
      </ProjectAdd>
    </template>
  </PagePanel>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import PagePanel from '@/layouts/PagePanel.vue';
import StatCard from '@/components/common/data/StatCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import ProjectConfirm from '../components/ProjectConfirm.vue';
import ProjectAdd from '../components/ProjectAdd.vue';

import ProjectDetails from '@/components/business/project/project-detail/index.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import { PROJECT_LIST_RULES } from '../config/data-table/projectList';

import { projectApi } from '@/api/project';
import { useLoading } from '@/composables/useLoading';
import { debounce } from '@/utils/debounce';

const router = useRouter();

const overViewStats = ref({
  totalProjects: 0,
  notStartedProjects: 0,
  ongoingProjects: 0,
  endedProjects: 0
})

const overViewCardsMap = computed(() => [
  { title: '总项目数', data: String(overViewStats.value.totalProjects), icon: 'Document', iconBackground: '', iconColor: '' },
  { title: '尚未开始的项目', data: String(overViewStats.value.notStartedProjects), icon: 'FolderOpened', iconBackground: 'var(--warning-light)', iconColor: 'var(--warning)' },
  { title: '进行中的项目', data: String(overViewStats.value.ongoingProjects), icon: 'Checked', iconBackground: 'var(--success-light)', iconColor: 'var(--success)' },
  { title: '已截止的项目', data: String(overViewStats.value.endedProjects), icon: 'Failed', iconBackground: 'var(--danger-light)', iconColor: 'var(--danger)' },
])

const totalData = ref(0)
const pageParams = reactive({
  page: 1,
  size: 10,
})

const projectList = ref([])

// const normalizeStatus = (status) => {
//   if (status === 'not_started' || status === 'ongoing' || status === 'ended') {
//     return status
//   }
//   return ''
// }

// const applyOverviewFromList = (list = [], total = 0) => {
//   const notStartedProjects = list.filter((item) => normalizeStatus(item?.status) === 'not_started').length
//   const ongoingProjects = list.filter((item) => normalizeStatus(item?.status) === 'ongoing').length
//   const endedProjects = list.filter((item) => normalizeStatus(item?.status) === 'ended').length

//   overViewStats.value = {
//     totalProjects: Number(total) || 0,
//     notStartedProjects,
//     ongoingProjects,
//     endedProjects
//   }
// }

const fetchProjectOverview = async () => {
  try {
    const response = await projectApi.getProjectOverview();
    const data = response?.data || {}
    overViewStats.value = {
      totalProjects: Number(data.totalProjects) || 0,
      notStartedProjects: Number(data.notStartedProjects) || 0,
      ongoingProjects: Number(data.ongoingProjects) || 0,
      endedProjects: Number(data.endedProjects) || 0
    }
  } catch (err) {
    console.log('获取项目概览数据失败', err)
  }

  // const pageSizeForOverview = 200
  // const firstPageResponse = await projectApi.getProjectList({ page: 1, size: pageSizeForOverview })
  // const firstPageData = firstPageResponse?.data || {}
  // const firstList = firstPageData.list || []
  // const total = Number(firstPageData.total) || 0

  // const allProjects = [...firstList]
  // const totalPages = Math.max(1, Math.ceil(total / pageSizeForOverview))
  // for (let page = 2; page <= totalPages; page += 1) {
  //   const pageResponse = await projectApi.getProjectList({ page, size: pageSizeForOverview })
  //   allProjects.push(...(pageResponse?.data?.list || []))
  // }

  // applyOverviewFromList(allProjects, total)
}

const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('adminProject:list')
const getProjectsList = async (pageParams) => {
  startLoading();
  try {
    const response = await projectApi.getProjectList(pageParams);
    projectList.value = response.data.list;
    totalData.value = response.data.total
    // applyOverviewFromList(response.data.list || [], response.data.total)
    console.log(projectList.value)
  } catch (err) {
    ElMessage.error('netWorkERROR', err)
    console.log('获取项目列表错误', err)
  } finally {
    endLoading();
  }
}
const debouncedLoadProject = debounce(getProjectsList, 300)
const showAddProjectDialog = ref(false);
const showDetailDialog = ref(false);
const pagenationDisabled = ref(false);
const handleSearch = (keywords) => {
  // console.log('搜索:', keywords);
  debouncedLoadProject({ ...pageParams, keyWords: keywords })
}

const handleEdit = (row) => {
  router.push({
    name: 'projectEdit',
    params: { id: row.id }
  });
}

const propjectDetail = ref({})
const handleViewPrDetails = (row) => {
  showDetailDialog.value = true;
  propjectDetail.value = row;
}

const showDeleteProjectDialog = ref(false);
const handlingProjectStatus = ref({});
const handleProjectStatus = (enableTogle, index, row) => {
  showDeleteProjectDialog.value = true
  handlingProjectStatus.value = { ...row, isEnabled: enableTogle };
}

// const handleStopProject = async (index, row) => {
//   try {
//     // const response = await projectApi.updateProject(row.id, { isEnabled: false })
//     // ElMessage.success('项目已停用')
//     ElMessage.success('项目已停用');
//     row.isEnabled = false;
//     // 或者重新获取列表
//     // await getProjectsList(pageParams);
//   } catch (err) {
//     ElMessage.error(`停用项目失败: ${err}`);
//   }
// }

const handleRefresh = async () => {
  await Promise.all([
    getProjectsList(pageParams),
    fetchProjectOverview()
  ]);
  ElMessage.success('数据已刷新');
}

const handleCurrentChange = (page) => {
  pageParams.page = page;
  getProjectsList(pageParams);
}

const handleSizeChange = (size) => {
  pageParams.size = size;
  pageParams.page = 1;
  getProjectsList(pageParams);
}

onMounted(() => {
  Promise.all([
    getProjectsList(pageParams),
    fetchProjectOverview()
  ]);
})

</script>

<style scoped></style>
