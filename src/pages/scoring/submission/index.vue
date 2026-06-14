<template>
  <div class="scoring-submission-page">
    <header class="page-header">
      <div>
        <h1>作业评分</h1>
        <p>按项目筛选待评分提交，查看 AI 评分参考后提交教师最终评分。</p>
      </div>
      <el-tag type="primary" effect="plain">评分工作台</el-tag>
    </header>

    <section class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="项目">
          <el-select v-model="filters.projectId" clearable filterable placeholder="全部项目" style="width: 240px"
            @change="handleFilterChange">
            <el-option v-for="project in projectOptions" :key="project.id" :label="project.name" :value="project.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部状态" style="width: 150px"
            @change="handleFilterChange">
            <el-option label="待评分" value="pending" />
            <el-option label="评分中" value="scoring" />
            <el-option label="已评分" value="scored" />
            <el-option label="已打回" value="returned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilterChange">刷新</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="stats-row">
      <StatCard label="待评分" :value="stats.pending" icon="Clock" icon-bg="var(--warning-light)"
        icon-color="var(--warning)" />
      <StatCard label="评分中" :value="stats.scoring" icon="Edit" icon-bg="var(--primary-light)"
        icon-color="var(--primary-havy)" />
      <StatCard label="已评分" :value="stats.scored" icon="Checked" icon-bg="var(--success-light)"
        icon-color="var(--success)" />
    </section>

    <main class="card-list" v-loading="loading">
      <el-empty v-if="!loading && submissionList.length === 0" description="暂无待处理提交" />
      <SubmissionGradingCard v-for="record in submissionList" :key="record.id" :record="record"
        :ai-score="aiScoreMap[record.id]" :submitting="submittingId === record.id" @save-draft="handleSaveDraft"
        @submit-score="handleSubmitScore" />

      <div class="pagination-wrap" v-if="total > pageParams.size">
        <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
          :page-sizes="[5, 10, 20]" :total="total" layout="sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import StatCard from '@/components/common/data/StatCard.vue';
import { projectApi } from '@/api/project';
import {
  normalizeSubmissionRecord,
  normalizeSubmissionScore,
  normalizeSubmissionStats,
  submissionApi,
} from '@/api/submission';
import { useLoading } from '@/composables/useLoading';
import { useMessage } from '@/composables/useMessage';
import SubmissionGradingCard from './components/SubmissionGradingCard.vue';

defineOptions({
  name: 'ScoringSubmissionPage'
});

const route = useRoute();
const message = useMessage();
const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('scoringSubmission:list');

const filters = reactive({
  projectId: route.query.projectId ? Number(route.query.projectId) : '',
  status: '',
});
const pageParams = reactive({ page: 1, size: 5 });
const projectOptions = ref([]);
const submissionList = ref([]);
const total = ref(0);
const stats = ref(normalizeSubmissionStats());
const aiScoreMap = reactive({});
const submittingId = ref(null);

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
});

const loadProjects = async () => {
  try {
    const response = await projectApi.getAuthorizedProjectList({ page: 1, size: 200 });
    const list = response?.data?.list || [];
    projectOptions.value = list.map((project) => ({ id: project.id, name: project.name || project.projectName || `项目 #${project.id}` }));
  } catch (error) {
    console.error('加载评分项目失败', error);
  }
};

const loadStats = async () => {
  try {
    const response = await submissionApi.getGradingStats({ projectId: filters.projectId || undefined });
    stats.value = normalizeSubmissionStats(response?.data || {});
  } catch (error) {
    console.error('加载评分统计失败', error);
    stats.value = normalizeSubmissionStats();
  }
};

const loadAiScores = async (records) => {
  await Promise.all(records.map(async (record) => {
    try {
      const response = await submissionApi.getSubmissionAiScore(record.id);
      aiScoreMap[record.id] = normalizeSubmissionScore(response?.data || {});
    } catch {
      aiScoreMap[record.id] = null;
    }
  }));
};

const loadSubmissions = async () => {
  startLoading();
  try {
    const response = await submissionApi.getGradingSubmissionList(buildQuery());
    const result = normalizeListResponse(response);
    submissionList.value = result.list;
    total.value = result.total;
    await loadAiScores(result.list);
  } catch (error) {
    console.error('加载评分提交列表失败', error);
    submissionList.value = [];
    total.value = 0;
  } finally {
    endLoading();
  }
};

const refresh = async () => {
  await Promise.all([loadSubmissions(), loadStats()]);
};

const handleFilterChange = async () => {
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

const handleSaveDraft = (_record, payload) => {
  message.info(`已暂存本地评分：${payload.totalScore || 0} 分`);
};

const handleSubmitScore = async (record, payload) => {
  submittingId.value = record.id;
  try {
    await submissionApi.submitSubmissionScore(record.id, payload);
    await submissionApi.finalizeSubmissionScore(record.id, payload);
    message.success('评分已提交');
    await refresh();
  } catch (error) {
    console.error('提交作业评分失败', error);
  } finally {
    submittingId.value = null;
  }
};

onMounted(async () => {
  await Promise.all([loadProjects(), refresh()]);
});
</script>

<style scoped>
.scoring-submission-page {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 32px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.page-header h1,
.page-header p {
  margin: 0;
}

.page-header p {
  margin-top: 8px;
  color: var(--text-secondary);
}

.filter-card {
  padding: 18px 20px;
  margin-bottom: 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card-bg);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.card-list {
  display: grid;
  gap: 18px;
  min-height: 320px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .scoring-submission-page {
    width: calc(100% - 24px);
    padding-top: 20px;
  }

  .page-header {
    flex-direction: column;
  }
}
</style>
