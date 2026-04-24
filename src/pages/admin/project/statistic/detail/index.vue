<template>
  <div class="project-statistic-detail-container">
    <!-- 返回和标题 -->
    <div class="detail-header">
      <el-button link @click="goBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回列表
      </el-button>
      <h1 class="page-title">{{ projectName }} - 打分统计详情</h1>
      <el-button type="primary" @click="handleExport(true)" :loading="exporting">
        <el-icon>
          <Download />
        </el-icon>
        导出项目打分记录
      </el-button>
      <el-button type="primary" @click="handleExport(false)" :loading="exporting">
        <el-icon>
          <Download />
        </el-icon>
        导出小组得分状态
      </el-button>
      <el-button type="primary" @click="handleExport(false, true)" :loading="exporting">
        <el-icon>
          <Download />
        </el-icon>
        导出恶意评分记录
      </el-button>
    </div>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="8" animated />

    <!-- 内容区 -->
    <div v-else class="detail-content">
      <!-- 刷新按钮 -->
      <div class="action-bar">
        <el-button @click="loadStatisticData" :loading="loading">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新数据
        </el-button>
        <span class="last-update">最后更新: {{ lastUpdateTime }}</span>
      </div>

      <div class="rule-summary">
        <div class="rule-summary-title">恶意判定规则</div>
        <div class="rule-summary-content">
          <el-tag :type="maliciousRuleType === 'THRESHOLD' ? 'warning' : 'info'" effect="dark">
            {{ maliciousRuleType === 'THRESHOLD' ? '阈值区间模式' : '默认算法模式（MAD）' }}
          </el-tag>
          <span class="rule-summary-desc">{{ maliciousRuleDesc }}</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="statistic-tabs">
        <!-- Tab 1: 小组统计 -->
        <el-tab-pane label="小组统计" name="group">
          <div class="tab-content">
            <h3 class="section-title">各小组平均得分</h3>
            <div v-if="statisticData.groupAverage?.length" class="group-list">
              <div v-for="group in statisticData.groupAverage" :key="group.groupId">
                <BaseCard class="group-item" shadow="hover">
                  <!-- 卡片主体：小组信息 + 得分进度 + 操作 -->
                  <div class="group-main">
                    <div class="group-info">
                      <span class="group-name" :title="group.groupName">{{ group.groupName }}</span>
                      <span class="group-id">#{{ group.groupId }}</span>
                    </div>
                    <div class="group-score">
                      <el-progress :percentage="getProgressPercentage(getDisplayScore(group), totalScoreAwait)"
                        :color="getScoreColor(getProgressPercentage(getDisplayScore(group), totalScoreAwait))"
                        :stroke-width="10" />
                      <span class="score-value">{{ formatScore(getDisplayScore(group)) }}</span>
                      <span class="score-total">/{{ totalScoreAwait }}</span>
                    </div>
                    <div class="group-actions">
                      <el-button type="primary" link @click="openGroupScoreDetailModal(group)">
                        查看明细
                      </el-button>
                    </div>
                  </div>
                  <!-- 卡片底部：元数据 -->
                  <div class="group-footer">
                    <div class="footer-divider"></div>
                    <div class="score-meta">
                      <span class="meta-item">
                        <span class="meta-label">原始</span>
                        <span class="meta-value">{{ formatScore(group.rawAverageScore) }}</span>
                      </span>
                      <span class="meta-sep">·</span>
                      <span class="meta-item">
                        <span class="meta-label">标准化</span>
                        <span class="meta-value">{{ formatScore(group.normalizedAverageScore) }}</span>
                      </span>
                      <span class="meta-sep">·</span>
                      <span class="meta-item">
                        <span class="meta-label">处理后</span>
                        <span class="meta-value meta-value--primary">{{
                          formatScore(group.processedAverageScore || group.averageScore)
                          }}</span>
                      </span>
                      <span class="meta-sep">·</span>
                      <span class="meta-item" :class="{ 'meta-item--warning': (group.abnormalCount ?? 0) > 0 }">
                        <span class="meta-label">恶意</span>
                        <span class="meta-value">{{ group.abnormalCount ?? 0 }}</span>
                      </span>
                      <span class="meta-sep">·</span>
                      <span class="meta-item">
                        <span class="meta-label">样本</span>
                        <span class="meta-value">{{ group.sampleSize ?? 0 }}</span>
                      </span>
                      <span class="meta-sep">·</span>
                      <span class="meta-item">
                        <span class="meta-label">有效</span>
                        <span class="meta-value">{{ group.validSampleSize ?? 0 }}</span>
                      </span>
                    </div>
                  </div>
                </BaseCard>
              </div>
            </div>
            <el-empty v-else description="暂无数据" />
          </div>
        </el-tab-pane>

        <!-- Tab 2: 指标统计 -->
        <el-tab-pane label="指标统计" name="indicator">
          <div class="tab-content">
            <h3 class="section-title">各指标平均得分</h3>
            <div v-if="statisticData.indicatorAverage?.length" class="indicator-list">
              <div v-for="indicator in statisticData.indicatorAverage" :key="indicator.indicatorId"
                class="indicator-item">
                <div class="indicator-info">
                  <span class="indicator-name">{{ indicator.indicatorName }}</span>
                  <span class="indicator-id">#{{ indicator.indicatorId }}</span>
                </div>
                <div class="indicator-score">
                  <el-progress
                    :percentage="getProgressPercentage(getDisplayScore(indicator), getIndicatorMaxScore(indicator.indicatorId))"
                    :color="getScoreColor(getDisplayScore(indicator))" :stroke-width="8" />
                  <span class="score-value">
                    {{ formatScore(getDisplayScore(indicator)) }}/
                    {{ getIndicatorMaxScore(indicator.indicatorId) }}
                  </span>
                </div>
                <div class="score-meta">
                  <span class="score-meta-item">原始: {{ formatScore(indicator.rawAverageScore) }}</span>
                  <span class="score-meta-item">标准化: {{ formatScore(indicator.normalizedAverageScore) }}</span>
                  <span class="score-meta-item">处理后: {{ formatScore(indicator.processedAverageScore ||
                    indicator.averageScore) }}</span>
                  <span class="score-meta-item">恶意: {{ indicator.abnormalCount ?? 0 }}</span>
                  <span class="score-meta-item">样本: {{ indicator.sampleSize ?? 0 }}</span>
                  <span class="score-meta-item">有效: {{ indicator.validSampleSize ?? 0 }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无数据" />
          </div>
        </el-tab-pane>

        <!-- Tab 3: 评分人分布 -->
        <el-tab-pane label="评分人分布" name="scorer">
          <div class="tab-content">
            <h3 class="section-title">评分人打分分布</h3>
            <div v-if="statisticData.scorerDistribution?.length" class="scorer-list">
              <el-table :data="statisticData.scorerDistribution" stripe>
                <el-table-column prop="userName" label="评分人" width="150" />
                <el-table-column prop="scoreRange" label="打分范围" width="150" />
                <el-table-column prop="count" label="打分次数" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag>{{ row.count }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="占比" width="180">
                  <template #default="{ row }">
                    <el-progress :percentage="getPercentage(row.count)"
                      :format="() => getPercentage(row.count) + '%'" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <el-empty v-else description="暂无数据" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <GroupIndicatorScoreModal :visible="groupScoreModalVisible" :selected-group="selectedGroup"
      :loading="groupIndicatorScoreLoading" :indicator-scores="groupIndicatorScores" :max-score-map="maxScores"
      @update:visible="groupScoreModalVisible = $event" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Download, Refresh } from "@element-plus/icons-vue";
import {
  getProjectScoringStatistic,
  exportProjectStatisticData,
  getProjectGroupIndicatorStatistic,
  exportProjectGroupIndicatorsData,
  exportProjectAbnormalScores,
} from "@/api/statistic";
import { getProjectDetail } from "@/api/project";
import { useScoreStore } from "@/stores/modules/scoreStore";
import GroupIndicatorScoreModal from "./components/GroupIndicatorScoreModal.vue";
import { getIndicatorsFromStandard } from "@/utils/scoringStandard";

defineOptions({
  name: "ProjectStatisticDetailPage",
});

const router = useRouter();
const route = useRoute();
const scoreStore = useScoreStore();

// ==================== 数据定义 ====================
const projectId = computed(() => route.params.projectId);
const projectName = ref("");
const maliciousRuleType = ref("AUTO");
const maliciousScoreLower = ref(null);
const maliciousScoreUpper = ref(null);
const loading = ref(false);
const exporting = ref(false);
const activeTab = ref("group");
const lastUpdateTime = ref("");
const maxScores = ref({});
const totalScore = ref(0);
const groupScoreModalVisible = ref(false);
const selectedGroup = ref({});
const groupIndicatorScoreLoading = ref(false);
const groupIndicatorScores = ref([]);
const statisticData = ref({
  groupAverage: [],
  indicatorAverage: [],
  scorerDistribution: [],
});

// ==================== 计算属性 ====================
const totalScoreAwait = computed(() => {
  return totalScore.value || 0;
});

const maliciousRuleDesc = computed(() => {
  if (maliciousRuleType.value === "THRESHOLD") {
    const lower = maliciousScoreLower.value ?? "-";
    const upper = maliciousScoreUpper.value ?? "-";
    return `总分低于 ${lower} 或高于 ${upper} 的评分将被标记为恶意评分，并从处理后均分中剔除。`;
  }
  return "采用 MAD 低分单侧算法自动识别恶意评分，并从处理后均分中剔除。";
});

const getIndicatorMaxScore = (indicatorId) => {
  if (!indicatorId) return;
  return maxScores.value[indicatorId]?.maxScore || 0;
};

const getProgressPercentage = (score, maxScore) => {
  if (!maxScore) return 0;
  return Math.min(((Number(score || 0) / maxScore) * 100).toFixed(2), 100);
};

const getDisplayScore = (item = {}) => {
  if (item.processedAverageScore !== undefined && item.processedAverageScore !== null) {
    return item.processedAverageScore;
  }
  return item.averageScore || 0;
};

const formatScore = (score) => {
  return Number(score || 0).toFixed(2);
};

// ==================== 方法 ====================
const loadProjectDetail = async () => {
  try {
    const response = await getProjectDetail(projectId.value);
    if (response.data) {
      projectName.value = response.data.name || `项目 ${projectId.value}`;
      maliciousRuleType.value = response.data.maliciousRuleType || "AUTO";
      maliciousScoreLower.value = response.data.maliciousScoreLower;
      maliciousScoreUpper.value = response.data.maliciousScoreUpper;
      if (response.data.standardId) {
        try {
          const standardData = await scoreStore.fetchScoreStandard(response.data.standardId);
          const standardIndicators = getIndicatorsFromStandard(standardData);
          if (standardIndicators.length) {
            totalScore.value = 0;
            maxScores.value = standardIndicators.reduce((obj, item) => {
              totalScore.value += item.maxScore;
              const { id, ...rest } = item;
              if (id !== undefined && id !== null) {
                obj[id] = rest;
              }
              return obj;
            }, {});
          }
        } catch (err) {
          console.warn("获取打分标准失败，使用默认满分值", err);
        }
      }
    }
  } catch (error) {
    console.error("加载项目详情失败:", error);
  }
};

const loadStatisticData = async () => {
  if (!projectId.value) return;
  loading.value = true;
  try {
    const response = await getProjectScoringStatistic(projectId.value);
    if (response.data) {
      statisticData.value = response.data;
      lastUpdateTime.value = new Date().toLocaleTimeString("zh-CN");
    }
  } catch (error) {
    ElMessage.error("加载统计数据失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const loadGroupIndicatorScores = async (groupId) => {
  if (!projectId.value || !groupId) return;
  groupIndicatorScoreLoading.value = true;
  try {
    const response = await getProjectGroupIndicatorStatistic(projectId.value, groupId);
    const responseData = response?.data || {};
    groupIndicatorScores.value = Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData.indicatorAverage)
        ? responseData.indicatorAverage
        : [];
  } catch (error) {
    groupIndicatorScores.value = [];
    ElMessage.error("加载小组指标得分失败");
    console.error(error);
  } finally {
    groupIndicatorScoreLoading.value = false;
  }
};

const openGroupScoreDetailModal = async (group) => {
  selectedGroup.value = group || {};
  groupScoreModalVisible.value = true;
  await loadGroupIndicatorScores(group?.groupId);
};

const getScoreColor = (percentage) => {
  if (percentage >= 80) return "#67c23a";
  if (percentage >= 70) return "#409eff";
  if (percentage >= 60) return "#e6a23c";
  return "#f56c6c";
};

const getPercentage = (count) => {
  const total = statisticData.value.scorerDistribution?.reduce((sum, item) => sum + item.count, 0) || 0;
  // return total > 0 ? Math.round((count / total) * 100) : 0;
  return total > 0 ? (count / total).toFixed(4) : 0;
};

const handleExport = async (isProject = true, isAbnormal = false) => {
  exporting.value = true;
  let requestFunc = exportProjectStatisticData;
  if (!isProject) requestFunc = exportProjectGroupIndicatorsData;
  if (isAbnormal) {
    requestFunc = exportProjectAbnormalScores;
  }
  try {
    const blobData = isAbnormal
      ? await requestFunc(projectId.value)
      : await requestFunc(projectId.value, "excel");
    const fileName = isAbnormal
      ? `${projectName.value}_恶意评分记录_${new Date().getTime()}.xlsx`
      : `${projectName.value}_打分统计_${new Date().getTime()}.xlsx`;
    const url = window.URL.createObjectURL(blobData);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success("数据导出成功");
  } catch (error) {
    ElMessage.error("导出失败");
    console.error(error);
  } finally {
    exporting.value = false;
  }
};

const goBack = () => {
  router.push({
    name: "projectStatisticList",
  });
};

onMounted(() => {
  loadProjectDetail();
  loadStatisticData();
});
</script>

<style scoped>
/* ==================== 全局布局 ==================== */
.project-statistic-detail-container {
  padding: 32px 24px;
  background-color: #f9fafb;
  min-height: 100vh;
}

/* ==================== 页面标题 ==================== */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
  min-width: 300px;
}

/* ==================== 操作栏 ==================== */
.action-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.last-update {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-left: auto;
}

.rule-summary {
  max-width: 1400px;
  margin: 0 auto 20px;
  padding: 14px 16px;
  background: #fffdf5;
  border: 1px solid #f3e8c3;
  border-radius: 12px;
}

.rule-summary-title {
  font-size: 13px;
  color: #7c6b35;
  margin-bottom: 8px;
}

.rule-summary-content {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.rule-summary-desc {
  color: #6b7280;
  font-size: 13px;
}

/* ==================== 标签页 ==================== */
.detail-content {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.statistic-tabs {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
}

.tab-content {
  padding: 24px 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

/* ==================== 小组列表（优化后） ==================== */
.group-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

/* 卡片容器 - 依赖 BaseCard 提供背景/阴影/圆角，这里仅做微调 */
.group-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

/* 卡片主体：去掉冗余的背景/边框，由 BaseCard 统一承载 */
.group-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

/* 小组信息 */
.group-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  min-width: 0;
  max-width: 160px;
}

.group-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-id {
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
}

/* 得分进度条区域 */
.group-score {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.group-score :deep(.el-progress) {
  flex: 1;
  min-width: 80px;
}

/* 进度条加粗 */
.group-score :deep(.el-progress-bar__outer) {
  height: 10px;
  border-radius: 6px;
  background-color: #e8ecf1;
}

.group-score :deep(.el-progress-bar__inner) {
  height: 10px;
  border-radius: 6px;
}

/* 分数数值 - 更醒目 */
.score-value {
  font-weight: 700;
  font-size: 1.15rem;
  color: #1f2937;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.score-total {
  font-size: 0.8rem;
  color: #9ca3af;
  white-space: nowrap;
  margin-left: -4px;
}

/* 操作按钮 */
.group-actions {
  flex-shrink: 0;
}

/* 卡片底部 */
.group-footer {
  margin-top: auto;
  padding-top: 4px;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(to right, #e5e7eb 0%, #e5e7eb 60%, transparent 100%);
  margin-bottom: 10px;
}

/* 元数据行 - 精致小标签风格 */
.score-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 4px;
  font-size: 0.72rem;
  color: #6b7280;
  line-height: 1.6;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  transition: background 0.2s;
}

.meta-item:hover {
  background: #e5e7eb;
}

/* 恶意评分 > 0 时高亮 */
.meta-item--warning {
  background: #fef2f2;
  color: #dc2626;
}

.meta-item--warning:hover {
  background: #fde8e8;
}

.meta-item--warning .meta-value {
  color: #dc2626;
  font-weight: 700;
}

.meta-label {
  color: #9ca3af;
  font-weight: 400;
}

.meta-value {
  color: #4b5563;
  font-weight: 500;
}

/* 处理后分数高亮 */
.meta-value--primary {
  color: #3b82f6;
  font-weight: 600;
}

/* 分隔符 */
.meta-sep {
  color: #d1d5db;
  font-size: 0.65rem;
  margin: 0 1px;
  user-select: none;
}

/* ==================== 指标列表 ==================== */
.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicator-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.indicator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.indicator-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.indicator-id {
  font-size: 0.75rem;
  color: #9ca3af;
}

.indicator-score {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 250px;
}

.indicator-score :deep(.el-progress) {
  flex: 1;
}

/* 指标区域的元数据保持原简洁风格 */
.indicator-item .score-meta {
  font-size: 0.75rem;
  gap: 8px 16px;
  margin-top: 8px;
}

.indicator-item .score-meta .score-meta-item {
  background: transparent;
  padding: 0;
}

.indicator-item .score-meta .score-meta-item:hover {
  background: transparent;
}

/* ==================== 评分人表格 ==================== */
.scorer-list {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.scorer-list :deep(.el-table) {
  border: 1px solid #e5e7eb;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.25rem;
    min-width: auto;
  }

  .group-list {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  /* 移动端：小组卡片内部改为垂直布局 */
  .group-main {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .group-info {
    max-width: none;
    flex-direction: row;
  }

  .group-score {
    flex-wrap: nowrap;
  }

  .group-actions {
    align-self: flex-end;
  }

  /* 移动端元数据去掉分隔符节省空间 */
  .meta-sep {
    display: none;
  }

  .meta-item {
    padding: 2px 5px;
  }

  .indicator-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .indicator-score {
    width: 100%;
    margin-top: 12px;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .project-statistic-detail-container {
    padding: 16px 10px;
  }

  .statistic-tabs {
    padding: 12px;
  }

  .tab-content {
    padding: 12px 0;
  }

  .group-score {
    gap: 6px;
  }

  .score-value {
    font-size: 1rem;
  }

  .group-name {
    font-size: 0.85rem;
  }
}
</style>
