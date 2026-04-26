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
                <GroupCard :group="group" :total-score-await="totalScoreAwait"
                  @openGroupModal="openGroupScoreDetailModal" />
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
              <IndicatorItem v-for="indicator in statisticData.indicatorAverage" :key="indicator.indicatorId"
                :indicator="indicator" :max-scores="maxScores" />
            </div>
            <el-empty v-else description="暂无数据" />
          </div>

        </el-tab-pane>

        <!-- Tab 3: 评分人分布 -->
        <el-tab-pane label="评分人分布" name="scorer">
          <div class="tab-content">
            <h3 class="section-title">评分人打分分布</h3>
            <div class="scorer-list">
              <SearchInput size="middle" :showAddBtn="false" @search="handleSearch" immediate :delay="300">
              </SearchInput>
              <el-table v-if="statisticData.scorerDistribution?.length" :data="statisticData.scorerDistribution" stripe
                style="width: 95%">
                <el-table-column prop="userName" label="评分人" />
                <el-table-column prop="scoreRange" label="打分范围" />
                <el-table-column prop="count" label="打分次数" width="" align="center">
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
              <el-empty v-else description="暂无数据" />
            </div>
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
import GroupCard from "./components/GroupCard.vue";
import IndicatorItem from "./components/IndicatorItem.vue";
import { removeSpacesFromObject } from "@/utils/removeSpacesFromData";

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

const backupStatisticData = ref(null);
const loadStatisticData = async () => {
  if (!projectId.value) return;
  loading.value = true;
  try {
    const response = await getProjectScoringStatistic(projectId.value);
    if (response.data) {
      statisticData.value = response.data;
      backupStatisticData.value = { ...response.data };
      lastUpdateTime.value = new Date().toLocaleTimeString("zh-CN");
    }
  } catch (error) {
    ElMessage.error("加载统计数据失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};


const handleSearch = (searchTerm) => {
  // 目前仅在评分人分布表格中使用，后续可根据需要扩展到其他部分
  if (activeTab.value === "scorer") {
    // 这里可以实现搜索功能，例如过滤 statisticData.value.scorerDistribution 数据
    if (searchTerm.trim() !== "") {
      statisticData.value.scorerDistribution = statisticData.value.scorerDistribution.filter((item) => {
        return item.userName.toLowerCase().includes(removeSpacesFromObject(searchTerm, true).toLowerCase());
      });
    } else {
      statisticData.value.scorerDistribution = backupStatisticData.value?.scorerDistribution || [];
      // 如果搜索框为空，则重新加载数据
      // debounce(loadStatisticData(), 300);
    }
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
@import "./styles/media.css";

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

/* ==================== 指标列表 ==================== */
.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ==================== 评分人表格 ==================== */
.scorer-list {
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
}

.scorer-list :deep(.el-table) {
  border: 1px solid #e5e7eb;
}
</style>
