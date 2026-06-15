<template>
  <PagePanel :bg-card="false">
    <template #header>
      <SubmissionStats :stats="stats" />
    </template>

    <SubmissionFilter v-model="filters" :projects="projectOptions" :exporting="exporting" @search="handleSearch"
      @reset="handleReset" @export="handleExport" />

    <template #main-table>
      <div class="table-card">
        <SubmissionTable :list="submissionList" :loading="loading" @view="handleView" @grade="handleGrade" />
        <div class="pagination-wrap" v-if="total > pageParams.size">
          <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
            :page-sizes="[10, 20, 50]" :total="total" layout="sizes, prev, pager, next" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </template>

    <template #modals>
      <SubmissionDetail v-model:visible="detailVisible" :record="selectedRecord" />
    </template>
  </PagePanel>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import PagePanel from '@/layouts/PagePanel.vue';
import { projectApi } from '@/api/project';
import {
  normalizeSubmissionRecord,
  normalizeSubmissionStats,
  submissionApi,
} from '@/api/submission';
import { useLoading } from '@/composables/useLoading';
import { useMessage } from '@/composables/useMessage';
import SubmissionDetail from './components/SubmissionDetail.vue';
import SubmissionFilter from './components/SubmissionFilter.vue';
import SubmissionStats from './components/SubmissionStats.vue';
import SubmissionTable from './components/SubmissionTable.vue';

defineOptions({
  name: 'AdminSubmissionPage'
});

const router = useRouter();
const message = useMessage();
const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('adminSubmission:list');

const filters = reactive({ projectId: '', status: '', keyword: '' });
const pageParams = reactive({ page: 1, size: 10 });
const total = ref(0);
const submissionList = ref([]);
const projectOptions = ref([]);
const stats = ref(normalizeSubmissionStats());
const detailVisible = ref(false);
const selectedRecord = ref(null);
const exporting = ref(false);

const normalizeListResponse = (response) => {
  const data = response?.data || {};
  const list = Array.isArray(data.list) ? data.list : Array.isArray(data.records) ? data.records : [];
  return {
    list: list.map(normalizeSubmissionRecord),
    total: Number(data.total) || list.length,
  };
};

const buildQuery = () => ({
  ...pageParams,
  projectId: filters.projectId || undefined,
  status: filters.status || undefined,
  keyword: filters.keyword || undefined,
});

const loadProjects = async () => {
  try {
    const response = await projectApi.getProjectList({ page: 1, size: 200 });
    const list = response?.data?.list || [];
    projectOptions.value = list.map((project) => ({ id: project.id, name: project.name || project.projectName || `项目 #${project.id}` }));
  } catch (error) {
    console.error('加载项目筛选项失败', error);
  }
};

const loadStats = async () => {
  try {
    const response = await submissionApi.getSubmissionStats({ projectId: filters.projectId || undefined });
    stats.value = normalizeSubmissionStats(response?.data || {});
  } catch (error) {
    console.error('加载提交统计失败', error);
    stats.value = normalizeSubmissionStats();
  }
};

const loadSubmissions = async () => {
  startLoading();
  try {
    const response = await submissionApi.getSubmissionList(buildQuery());
    const result = normalizeListResponse(response);
    submissionList.value = result.list;
    total.value = result.total;
  } catch (error) {
    console.error('加载提交列表失败', error);
    submissionList.value = [];
    total.value = 0;
  } finally {
    endLoading();
  }
};

const refresh = async () => {
  await Promise.all([loadSubmissions(), loadStats()]);
};

const handleSearch = async (value) => {
  Object.assign(filters, value || {});
  pageParams.page = 1;
  await refresh();
};

const handleReset = async () => {
  Object.assign(filters, { projectId: '', status: '', keyword: '' });
  pageParams.page = 1;
  await refresh();
};

const handleSizeChange = async (size) => {
  pageParams.size = size;
  pageParams.page = 1;
  await loadSubmissions();
};

const handleCurrentChange = async (page) => {
  pageParams.page = page;
  await loadSubmissions();
};

const handleView = (record) => {
  selectedRecord.value = record;
  detailVisible.value = true;
};

const handleGrade = (record) => {
  router.push({ path: '/scoring/submissions', query: { projectId: record.projectId, submissionId: record.id } });
};

const handleExport = async () => {
  exporting.value = true;
  try {
    await submissionApi.exportSubmissions(buildQuery());
    message.success('导出任务已提交');
  } catch (error) {
    console.error('导出提交列表失败', error);
  } finally {
    exporting.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadProjects(), refresh()]);
});
</script>

<style scoped>
.table-card {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card-bg);
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}
</style>
