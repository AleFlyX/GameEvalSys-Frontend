<template>
  <AdminPanel>
    <template #dataCards>
      <OverviewCard v-for="card in overViewCardsMap" :key="card.title" :title="card.title" :icon="card.icon"
        :data="card.data" :icon-background="card.iconBackground" :icon-color="card.iconColor">
      </OverviewCard>
    </template>

    <SearchInput size="middle" @search="handleSearch" @add="handleAdd"></SearchInput>

    <template #dataTable>
      <el-table :data="projectList">
        <DataTableColums :col-rules="columnsRules"></DataTableColums>
        <el-table-column>
          <template #header>
            <div style="display: flex; justify-content: start;">
              操作
            </div>
          </template>
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button v-if="!scope.row.isEnabled" size="small" type="primary"
              @click="handleStartProject(scope.$index, scope.row)">
              开始
            </el-button>
            <el-button v-if="scope.row.isEnabled" size="small" type="danger"
              @click="handleStopProject(scope.$index, scope.row)">
              停用
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
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
      <ProjectConfirmDelete v-model:visible="showDeleteProjectDialog" :data="waitToDelete"></ProjectConfirmDelete>
      <ProjectAdd></ProjectAdd>
      <ProjectEdit></ProjectEdit>
      <button @click="showDeleteProjectDialog = !showDeleteProjectDialog">testDelete</button>
    </template>
  </AdminPanel>
</template>

<script setup>
import AdminPanel from '@/layouts/AdminPanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import ProjectConfirmDelete from './components/ProjectConfirmDelete.vue';

import { reactive, ref, onMounted } from 'vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';

import { projectApi } from '@/api/project';
import { columnsRules } from './utils/projectListTableRule';

import { ElMessage } from 'element-plus';
import ProjectAdd from './components/ProjectAdd.vue';
import ProjectEdit from './components/ProjectEdit.vue';

const overViewCardsMap = ref([
  { title: '总项目数', data: '23', icon: 'Document', iconBackground: '', iconColor: '' },
  { title: '尚未开始的项目', data: '12', icon: 'FolderOpened', iconBackground: 'var(--warning-light)', iconColor: 'var(--warning)' },
  { title: '进行中的项目', data: '2', icon: 'Checked', iconBackground: 'var(--success-light)', iconColor: 'var(--success)' },
  { title: '已截止的项目', data: '3', icon: 'Failed', iconBackground: 'var(--danger-light)', iconColor: 'var(--danger)' },
])

const totalData = ref(100)
const pageParams = reactive({
  page: 1,
  size: 10,
})

const projectList = ref([
  {
    id: 1,
    name: "2026中期答辩",
    status: "not_started",
    isEnabled: true,
    startDate: "2026-03-01",
    endDate: "2026-03-15"
  },
  {
    id: 2,
    name: "2026期答辩",
    status: "not_started",
    isEnabled: false,
    startDate: "2026-03-01",
    endDate: "2026-03-15"
  },
  {
    id: 3,
    name: "2026后期答辩",
    status: "started",
    isEnabled: true,
    startDate: "2026-03-01",
    endDate: "2026-03-15"
  },
  {
    id: 3,
    name: "2026后期答辩",
    status: "ended",
    isEnabled: true,
    startDate: "2026-03-01",
    endDate: "2026-03-15"
  },
])
const getProjectsList = async (pageParams) => {
  try {
    const response = await projectApi.getProjectList(pageParams);
    projectList.value = response.data.list;
  } catch (err) {
    ElMessage.error('netWorkERROR', err)
    console.log('获取项目列表错误', err)
  }
}

const showDeleteProjectDialog = ref(false);
const showAddProjectDialog = ref(false);
const showEditProjectDialog = ref(false);
const handleSearch = (keywords) => {

}

const handleAdd = () => {
  showAddProjectDialog.value = !showAddProjectDialog.value;
}

const handleEdit = (row) => {
  showEditProjectDialog.value = !showEditProjectDialog.value;
}

const handleDelete = () => {
  showDeleteProjectDialog.value = !showDeleteProjectDialog.value;
}

const handleStartProject = (row) => {

}

const handleStopProject = (row) => {

}

onMounted(() => {
  getProjectsList()
})

</script>

<style scoped></style>
