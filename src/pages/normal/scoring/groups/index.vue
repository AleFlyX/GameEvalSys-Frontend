<template>
  <div class="group-scoring-page">
    <section class="page-hero">
      <BaseCard class="hero-main" shadow="always">
        <MyBtn type="link" class="back-link" @click="$router.push('/scoring')">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回项目列表
        </MyBtn>

        <div class="hero-copy">
          <p class="eyebrow">评分任务流</p>
          <h2>{{ projectName }}</h2>
          <p>按任务卡逐个完成小组评分，未评分任务会优先显示在前面。</p>
        </div>
      </BaseCard>

      <BaseCard root-class="hero-summary" shadow="always">
        <BaseCard shadow="hover">
          <div class="summary-item">
            <span>全部小组</span>
            <strong>{{ groupList.length }}</strong>
          </div>
        </BaseCard>
        <BaseCard shadow="hover">
          <div class="summary-item">
            <span>未评分</span>
            <strong>{{ pendingCount }}</strong>
          </div>
        </BaseCard>
        <BaseCard shadow="hover">
          <div class="summary-item">
            <span>已评分</span>
            <strong>{{ scoredCount }}</strong>
          </div>
        </BaseCard>
      </BaseCard>
    </section>

    <BaseCard class="toolbar-panel" shadow="always">
      <div class="toolbar-main">
        <SearchInput ref="searchBarRef" @search="handleSearch" :showAddBtn="false" size="middle" immediate :delay="200">
          <template #operations>
            <MyBtn @click="handleResetSearch">重置</MyBtn>
          </template>
        </SearchInput>
      </div>

      <div class="filter-tabs">
        <button v-for="tab in statusTabs" :key="tab.name" type="button" class="filter-tab"
          :class="{ active: activeName === tab.name }" @click="activeName = tab.name">
          <span>{{ tab.label }}</span>
          <strong>{{ tab.count }}</strong>
        </button>
      </div>
    </BaseCard>

    <BaseCard class="task-section">
      <div class="section-head">
        <div>
          <h3>{{ currentSectionTitle }}</h3>
          <p>{{ currentSectionDescription }}</p>
        </div>
      </div>

      <el-empty v-if="filteredGroups.length === 0" description="当前筛选下暂无小组数据" />
      <div v-else class="group-card-list">
        <ScoringGroupCard :groups="filteredGroups" @score="handleScoring" @view-score="handleViewScore" />
      </div>
    </BaseCard>

    <ScoreProject v-model:visible="showScoringFormDialog" :project-id="projectId" :project-name="projectName"
      :group-data="selectedGroup" @refresh="handleRefresh" />
    <ScoringDetails v-model:visible="showScoringDetailDialog" :selected-group="selectedGroup"
      :scoring-details="scoringDetails" :scoring-std-details="scoringStdDetails" :total-score="totalScore" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

import ScoreProject from './components/ScoreProject.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';
import ScoringDetails from './components/ScoringDetails.vue';
import BaseCard from '@/components/common/data/BaseCard.vue';
import ScoringGroupCard from './components/ScoringGroupCard.vue';

import { useProjectStore } from '@/stores/modules/projectStore';
import { useScoreStore } from '@/stores/modules/scoreStore';
import { useGroupScoringProject } from './composables/useGroupScoringProject';
import { useGroupScoringFilters } from './composables/useGroupScoringFilters';
import { useGroupScoringRecords } from './composables/useGroupScoringRecords';

defineOptions({
  name: 'GroupScoringPage'
});

const projectStore = useProjectStore();
const scoreStore = useScoreStore();
const route = useRoute();
const { projectId, projectName, warmupProjectDetails } = useGroupScoringProject(route, projectStore);
const {
  groupList,
  selectedGroup,
  showScoringFormDialog,
  showScoringDetailDialog,
  scoringDetails,
  scoringStdDetails,
  totalScore,
  fetchGroups,
  handleScoring,
  handleViewScore,
  handleRefresh,
} = useGroupScoringRecords({
  projectId,
  projectStore,
  scoreStore,
});
const {
  activeName,
  searchBarRef,
  filteredGroups,
  handleSearch,
  handleResetSearch,
} = useGroupScoringFilters(groupList);

const pendingCount = computed(() => groupList.value.filter((group) => group.scoreStatus !== 'scored').length);
const scoredCount = computed(() => groupList.value.filter((group) => group.scoreStatus === 'scored').length);

const statusTabs = computed(() => [
  { name: 'not_scored', label: '未评分', count: pendingCount.value },
  { name: 'scored', label: '已评分', count: scoredCount.value },
]);

const currentSectionTitle = computed(() => (activeName.value === 'scored' ? '已完成的小组' : '待处理的小组'));
const currentSectionDescription = computed(() => (
  activeName.value === 'scored'
    ? '这里展示已经提交过评分的小组，可继续查看详情或再次评分。'
    : '优先完成这些尚未提交评分的小组，任务会随着提交自动刷新。'
));

onMounted(() => {
  warmupProjectDetails();
  fetchGroups();
});
</script>

<style scoped>
.group-scoring-page {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(47, 107, 255, 0.1), transparent 30%),
    linear-gradient(180deg, #f4f7fb 0%, #eef3f9 100%);
  box-sizing: border-box;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.8fr);
  gap: 20px;
  margin-bottom: 24px;
}

.hero-main,
.hero-summary,
.toolbar-panel,
.task-section {
  border: 1px solid rgba(227, 234, 245, 0.95);
  backdrop-filter: blur(8px);
}

.hero-main {
  border-radius: 28px;
  padding: 24px 28px;
}

.back-link {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  color: #2f6bff;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #2f6bff;
}

.hero-copy h2 {
  margin: 0;
  font-size: 30px;
  line-height: 1.25;
  color: var(--text);
}

.hero-copy p:last-child {
  margin: 0;
  line-height: 1.7;
  color: var(--text-secondary);
}

.hero-summary {
  display: grid;
  gap: 14px;
  border-radius: 28px;
  padding: 22px;
}

.summary-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.summary-item span {
  color: var(--text-secondary);
}

.summary-item strong {
  font-size: 28px;
  color: var(--text);
}

.toolbar-panel,
.task-section {
  border-radius: 28px;
}

.toolbar-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
  padding: 24px 28px;
}

.toolbar-main {
  max-width: 700px;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid #dce5f2;
  border-radius: 999px;
  background: #f8fbff;
  color: #54657f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab strong {
  min-width: 22px;
  font-size: 14px;
}

.filter-tab.active {
  border-color: transparent;
  background: linear-gradient(135deg, #2f6bff 0%, #20b7c7 100%);
  color: #fff;
  box-shadow: 0 12px 24px rgba(47, 107, 255, 0.22);
}

.task-section {
  padding: 28px;
}

.section-head {
  margin-bottom: 20px;
}

.section-head h3 {
  margin: 0;
  font-size: 22px;
  color: var(--text);
}

.section-head p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.group-card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 960px) {
  .group-scoring-page {
    padding: 20px;
  }

  .page-hero {
    grid-template-columns: 1fr;
  }

  .group-card {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 640px) {

  .hero-main,
  .hero-summary,
  .toolbar-panel,
  .task-section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero-copy h2 {
    font-size: 24px;
  }
}
</style>
