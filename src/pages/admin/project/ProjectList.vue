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
            <!-- 删除放到编辑里边 -->
            <el-button size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button v-if="!scope.row.isEnabled" size="small" type="primary"
              @click="handleStartProject(scope.$index, scope.row)">
              启用
            </el-button>
            <el-button v-if="scope.row.isEnabled" size="small" type="danger"
              @click="handleStopProject(scope.$index, scope.row)">
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
      <ProjectConfirm v-model:visible="showDeleteProjectDialog" :data="waitToDelete" @refresh="handleRefresh">
      </ProjectConfirm>
      <ProjectAdd v-model:visible="showAddProjectDialog" @refresh="handleRefresh">
      </ProjectAdd>
      <ProjectEdit v-model:visible="showEditProjectDialog" :data="editingProject" @refresh="handleRefresh">
      </ProjectEdit>
    </template>
  </AdminPanel>
</template>

<script setup>
import AdminPanel from '@/layouts/AdminPanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import ProjectConfirm from './components/ProjectConfirm.vue';

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
const waitToDelete = ref({});
const editingProject = ref({});
const pagenationDisabled = ref(false);
const handleSearch = (keywords) => {
  // 搜索功能待实现
  console.log('搜索:', keywords);
}

const handleAdd = () => {
  showAddProjectDialog.value = true;
}

const handleEdit = (row) => {
  editingProject.value = { ...row };
  showEditProjectDialog.value = true;
}

const handleStartProject = async (index, row) => {
  try {
    // const response = await projectApi.updateProject(row.id, { isEnabled: true })
    // ElMessage.success('项目已启用')
    ElMessage.success('项目已启用');
    row.isEnabled = true;
    // 或者重新获取列表
    // await getProjectsList(pageParams);
  } catch (err) {
    ElMessage.error(`启用项目失败: ${err}`);
  }
}

const handleStopProject = async (index, row) => {
  try {
    // const response = await projectApi.updateProject(row.id, { isEnabled: false })
    // ElMessage.success('项目已停用')
    ElMessage.success('项目已停用');
    row.isEnabled = false;
    // 或者重新获取列表
    // await getProjectsList(pageParams);
  } catch (err) {
    ElMessage.error(`停用项目失败: ${err}`);
  }
}

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
