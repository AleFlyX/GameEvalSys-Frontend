<template>
  <BaseDialogModal v-bind="$attrs" :visible="visible" :max-width="900" @update:visible="emit('update:visible', $event)">
    <template #header>
      {{ selectedGroup?.groupName || selectedGroup?.name || "小组" }} - 指标平均得分
    </template>
    <template #body>
      <div class="modal-body">
        <el-skeleton v-if="loading" :rows="5" animated />
        <el-empty v-else-if="!indicatorScores.length" description="暂无小组指标得分数据" />
        <el-table v-else :data="indicatorScores" stripe>
          <el-table-column label="指标名称" min-width="220">
            <template #default="{ row }">
              <div class="indicator-cell">
                <span class="name">{{ row.indicatorName || getIndicatorName(row.indicatorId) }}</span>
                <span class="id">#{{ row.indicatorId }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="处理后均分" width="220">
            <template #default="{ row }">
              <span class="score">
                {{ formatScore(getDisplayScore(row)) }}/{{ getIndicatorMaxScore(row.indicatorId) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="原始/标准化" width="220">
            <template #default="{ row }">
              <div class="meta-pair">
                <span>原始: {{ formatScore(row.rawAverageScore) }}</span>
                <span>标准化: {{ formatScore(row.normalizedAverageScore) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="异常/样本" width="200">
            <template #default="{ row }">
              <div class="meta-pair">
                <span>异常: {{ row.abnormalCount ?? 0 }}</span>
                <span>样本: {{ row.sampleSize ?? 0 }}</span>
                <span>有效: {{ row.validSampleSize ?? 0 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="得分进度" min-width="280">
            <template #default="{ row }">
              <el-progress :percentage="getPercentage(getDisplayScore(row), row.indicatorId)" :stroke-width="10" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
    <template #footer>
      <button class="cancel-btn" @click="emit('update:visible', false)">关闭</button>
    </template>
  </BaseDialogModal>
</template>

<script setup>
import BaseDialogModal from "@/components/common/modal/BaseDialogModal.vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  selectedGroup: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  indicatorScores: {
    type: Array,
    default: () => [],
  },
  maxScoreMap: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible"]);

const getIndicatorMaxScore = (indicatorId) => {
  return props.maxScoreMap?.[indicatorId]?.maxScore || 0;
};

const getIndicatorName = (indicatorId) => {
  return props.maxScoreMap?.[indicatorId]?.name || "未知指标";
};

const getPercentage = (averageScore, indicatorId) => {
  const maxScore = getIndicatorMaxScore(indicatorId);
  if (!maxScore) return 0;
  return Math.min(Math.round((Number(averageScore || 0) / maxScore) * 100), 100);
};

const getDisplayScore = (row = {}) => {
  if (row.processedAverageScore !== undefined && row.processedAverageScore !== null) {
    return row.processedAverageScore;
  }
  return row.averageScore || 0;
};

const formatScore = (score) => {
  return Number(score || 0).toFixed(2);
};
</script>

<style scoped>
.modal-body {
  min-height: 120px;
}

.indicator-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-cell .name {
  font-weight: 600;
}

.indicator-cell .id {
  font-size: 12px;
  color: #909399;
}

.score {
  font-weight: 600;
  color: #1f2937;
}

.meta-pair {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}
</style>
