<template>
  <PagePanel>
    <template #header>
      <OverviewCard v-for="card in overViewCardsMap" :key="card.title" :title="card.title" :icon="card.icon"
        :data="card.data" :icon-background="card.iconBackground" :icon-color="card.iconColor">
      </OverviewCard>
    </template>

    <template #main-table>
      <SearchInput size="middle" @search="handleSearch" @add="showAddProjectDialog = true"></SearchInput>
      <el-table :data="projectList" v-loading="loading">
        <DataTableColums :col-rules="PROJECT_LIST_RULES"></DataTableColums>
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
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import PagePanel from '@/layouts/PagePanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import ProjectConfirm from '../components/ProjectConfirm.vue';
import ProjectAdd from '../components/ProjectAdd.vue';

import ProjectDetails from '@/components/business/project/project-detail/index.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import { PROJECT_LIST_RULES } from '../config/data-table/projectList';

import { projectApi } from '@/api/project';
import { useLoading } from '@/composables/useLodaing';
import { debounce } from '@/utils/debounce';

const router = useRouter();

const overViewCardsMap = ref([
  { title: '总项目数', data: '23', icon: 'Document', iconBackground: '', iconColor: '' },
  { title: '尚未开始的项目', data: '12', icon: 'FolderOpened', iconBackground: 'var(--warning-light)', iconColor: 'var(--warning)' },
  { title: '进行中的项目', data: '2', icon: 'Checked', iconBackground: 'var(--success-light)', iconColor: 'var(--success)' },
  { title: '已截止的项目', data: '3', icon: 'Failed', iconBackground: 'var(--danger-light)', iconColor: 'var(--danger)' },
])

const totalData = ref(0)
const pageParams = reactive({
  page: 1,
  size: 10,
})

const projectList = ref([])

const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('adminProject:list')
const getProjectsList = async (pageParams) => {
  startLoading();
  try {
    const response = await projectApi.getProjectList(pageParams);
    projectList.value = response.data.list;
    totalData.value = response.data.total
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
  await getProjectsList(pageParams);
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
  getProjectsList(pageParams);
})

</script>

<style scoped></style>
