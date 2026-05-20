<template>
  <PagePanel>
    <template #header>
      <StatCard icon="Document" label="总项目数" :value="scoringOverview.totalProjects" icon-color="var(--primary-havy)"
        icon-bg="var(--primary-light)" />
      <StatCard icon="Clock" label="进行中的项目" :value="scoringOverview.ongoingProjects" icon-color="var(--warning)"
        icon-bg="var(--warning-light)" />
      <StatCard icon="Checked" label="已完成打分" :value="scoringOverview.completedProjects" icon-color="var(--success)"
        icon-bg="var(--success-light)" />
      <StatCard icon="Failed" label="待完成打分" :value="scoringOverview.pendingProjects" icon-color="var(--danger)"
        icon-bg="var(--danger-light)" />
    </template>

    <div class="scoring-hero">
      <BaseCard class="hero-copy" shadow="always">
        <p class="eyebrow">评分工作台</p>
        <h2>优先处理待评分项目，让任务推进更清晰</h2>
        <p class="hero-desc">
          选择项目卡片进入评分
        </p>
      </BaseCard>
      <BaseCard class="hero-highlight" shadow="always">
        <span class="highlight-label">当前待处理</span>
        <strong>{{ scoringOverview.pendingProjects }}</strong>
        <p>建议优先进入进行中或接近截止的项目。</p>
      </BaseCard>
    </div>

    <template #main-table>
      <section class="project-workbench" v-loading="initLoading || loadingTable">
        <div class="section-head">
          <div>
            <h3>项目任务列表</h3>
            <p>点击卡片即可进入评分或查看项目详情。</p>
          </div>
        </div>

        <el-empty v-if="scoringList.length === 0" description="暂无可评分项目" />

        <div v-else class="project-grid">
          <BaseCard v-for="project in scoringList" :key="project.id" class="project-card"
            :class="`status-${project.status || 'default'}`" shadow="hover">
            <div class="card-top">
              <div class="card-title-group">
                <h4>{{ project.name }}</h4>
                <el-tag effect="light" round :type="getProjectStatusTag(project.status)">
                  {{ formatProjectStatus(project.status) }}
                </el-tag>
              </div>
              <span class="project-id">#{{ project.id }}</span>
            </div>

            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-label">开始时间</span>
                <span class="meta-value">{{ project.startDate || '-' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">结束时间</span>
                <span class="meta-value">{{ project.endDate || '-' }}</span>
              </div>
            </div>

            <div class="progress-panel">
              <div class="progress-head">
                <span>评分进度</span>
                <strong>{{ project.completionRate || '0%' }}</strong>
              </div>
              <el-progress :percentage="getCompletionNumber(project.completionRate)" :stroke-width="10"
                :show-text="false" :color="getProgressColor(project.status)" />
              <div class="progress-caption">
                <span>状态：{{ formatProjectStatus(project.status) }}</span>
                <span>{{ getProjectStageText(project) }}</span>
              </div>
            </div>

            <div class="card-actions">
              <el-button v-loading="loadingTable" type="primary" @click="handleStartScoring(project)">
                进入评分
              </el-button>
              <el-button @click="handleViewDetail(project)">项目详情</el-button>
            </div>
          </BaseCard>
        </div>
      </section>
    </template>

    <template #footer>
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="defaultPageSizes"
        size="middle" :disabled="disabled" :total="total" layout="sizes, prev, pager, next"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </template>

    <template #modals>
      <ProjectDetails v-model:visible="showProjectDetailDialog" :selected-project="selectedProject" />
    </template>
  </PagePanel>
</template>

<script setup>
import PagePanel from '@/layouts/PagePanel.vue';
import BaseCard from '@/components/common/data/BaseCard.vue';
import ProjectDetails from '@/components/business/project/project-detail/index.vue';

import { useScoringList } from './composables/useScoringList';
import { useHandleInteract } from './composables/useHandleInteract';

defineOptions({
  name: 'ScoringListPage'
});

const {
  currentPage,
  pageSize,
  total,
  disabled,
  defaultPageSizes,
  handleSizeChange,
  handleCurrentChange,
  initLoading,
  scoringList,
  scoringOverview,
} = useScoringList();

const {
  selectedProject,
  showProjectDetailDialog,
  loadingTable,
  handleStartScoring,
  handleViewDetail
} = useHandleInteract();

const projectStatusNameMap = {
  not_started: '未开始',
  ongoing: '进行中',
  ended: '已截止'
};

const projectStatusTagMap = {
  not_started: 'warning',
  ongoing: 'success',
  ended: 'danger'
};

const projectProgressColorMap = {
  not_started: '#f59e0b',
  ongoing: '#2f6bff',
  ended: '#ef6b6b'
};

const formatProjectStatus = (status) => projectStatusNameMap[status] || '待处理';

const getProjectStatusTag = (status) => projectStatusTagMap[status] || 'info';

const getCompletionNumber = (completionRate) => {
  const parsed = Number(String(completionRate || '0').replace('%', ''));
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, Math.round(parsed)));
};

const getProgressColor = (status) => projectProgressColorMap[status] || '#2f6bff';

const getProjectStageText = (project) => {
  const completion = getCompletionNumber(project?.completionRate);
  if (project?.status === 'ended' && completion < 100) return '项目已截止，可查看当前完成情况';
  if (completion >= 100) return '本项目已全部完成评分';
  if (project?.status === 'ongoing') return '项目仍在进行中，适合继续处理';
  if (project?.status === 'not_started') return '项目尚未开始，可提前查看规则';
  return '可进入项目查看详细任务';
};
</script>

<style scoped>
.scoring-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(240px, 0.8fr);
  gap: 20px;
  align-items: stretch;
}

.hero-copy,
.hero-highlight {
  border-radius: 24px;
  overflow: hidden;
}

.hero-copy {
  background:
    radial-gradient(circle at top left, rgba(47, 107, 255, 0.16), transparent 36%),
    linear-gradient(135deg, var(--card-bg) 0%, #f2f7ff 100%);
  border: 1px solid var(--border);
  padding: 28px 30px;
}

html[data-theme="dark"] .hero-copy {
  background:
    radial-gradient(circle at top left, rgba(47, 107, 255, 0.08), transparent 36%),
    linear-gradient(135deg, var(--card-bg) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #2f6bff;
}

.hero-copy h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.3;
  color: var(--text);
}

.hero-desc {
  margin: 12px 0 0;
  max-width: 640px;
  line-height: 1.75;
  color: var(--text-secondary);
}

.hero-highlight {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(160deg, var(--el-color-primary) 0%, #20b7c7 100%);
  color: #fff;
  padding: 24px 24px 22px;
}

html[data-theme="dark"] .hero-highlight {
  background: linear-gradient(160deg, var(--el-color-primary) 0%, #1a8a96 100%);
}

.highlight-label {
  font-size: 13px;
  opacity: 0.88;
}

.hero-highlight strong {
  font-size: 48px;
  line-height: 1;
}

.hero-highlight p {
  margin: 0;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

.project-workbench {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-head h3 {
  margin: 0;
  font-size: 22px;
  color: var(--text);
}

.section-head p {
  margin: 8px 0 0;
  color: var(--text-secondary);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, var(--card-bg) 0%, rgba(251, 252, 255, 0.6) 100%);
  border: 1px solid var(--border);
  padding: 22px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

html[data-theme="dark"] .project-card {
  background: linear-gradient(180deg, var(--card-bg) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(31, 42, 68, 0.12);
}

.project-card.status-ongoing {
  border-color: rgba(47, 107, 255, 0.24);
}

.project-card.status-ended {
  border-color: rgba(239, 107, 107, 0.18);
}

.project-card.status-not_started {
  border-color: rgba(245, 158, 11, 0.22);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.card-title-group h4 {
  margin: 0;
  font-size: 20px;
  line-height: 1.45;
  color: #1f2a44;
  word-break: break-word;
}

.project-id {
  flex-shrink: 0;
  font-size: 13px;
  color: #98a5bc;
}

.card-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f7f9fd;
}

.meta-label {
  font-size: 12px;
  color: #90a0bb;
}

.meta-value {
  color: #30415f;
  line-height: 1.5;
}

.progress-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 20px;
  background: #f9fbff;
}

.progress-head,
.progress-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.progress-head {
  color: #51627f;
}

.progress-head strong {
  font-size: 22px;
  color: #1f2a44;
}

.progress-caption {
  font-size: 12px;
  line-height: 1.5;
  color: #90a0bb;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.card-actions .el-button {
  min-width: 108px;
}

@media (max-width: 960px) {
  .scoring-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-copy {
    padding: 22px 20px;
  }

  .hero-copy h2 {
    font-size: 24px;
  }

  .project-grid,
  .card-meta {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
