<template>
  <BaseCard shadow="hover" class="indicator-item">
    <div class="indicator-info">
      <span class="indicator-name">{{ indicator.indicatorName }}</span>
      <span class="indicator-id">#{{ indicator.indicatorId }}</span>
    </div>
    <div class="indicator-score">
      <el-progress
        :percentage="getProgressPercentage(getDisplayScore(indicator), getIndicatorMaxScore(indicator.indicatorId))"
        :color="getScoreColor(getDisplayScore(indicator) / getIndicatorMaxScore(indicator.indicatorId) * 100)"
        :stroke-width="8" />
      <span class="score-value">
        {{ formatScore(getDisplayScore(indicator)) }}/
        {{ getIndicatorMaxScore(indicator.indicatorId) }}
      </span>
    </div>
    <div class="score-meta">
      <span class="meta-item">
        <span class="meta-label">原始</span>
        <span class="meta-value">{{ formatScore(indicator.rawAverageScore) }}</span>
      </span>
      <span class="meta-sep">·</span>
      <span class="meta-item">
        <span class="meta-label">标准化</span>
        <span class="meta-value">{{ formatScore(indicator.normalizedAverageScore) }}</span>
      </span>
      <span class="meta-sep">·</span>
      <span class="meta-item">
        <span class="meta-label">处理后</span>
        <span class="meta-value meta-value--primary">{{
          formatScore(indicator.processedAverageScore || indicator.averageScore)
          }}</span>
      </span>
      <span class="meta-sep">·</span>
      <span class="meta-item" :class="{ 'meta-item--warning': (indicator.abnormalCount ?? 0) > 0 }">
        <span class="meta-label">恶意</span>
        <span class="meta-value">{{ indicator.abnormalCount ?? 0 }}</span>
      </span>
      <span class="meta-sep">·</span>
      <span class="meta-item">
        <span class="meta-label">样本</span>
        <span class="meta-value">{{ indicator.sampleSize ?? 0 }}</span>
      </span>
      <span class="meta-sep">·</span>
      <span class="meta-item">
        <span class="meta-label">有效</span>
        <span class="meta-value">{{ indicator.validSampleSize ?? 0 }}</span>
      </span>
    </div>
    <!-- <div class="score-meta">
      <span class="score-meta-item">原始: {{ formatScore(indicator.rawAverageScore) }}</span>
      <span class="score-meta-item">标准化: {{ formatScore(indicator.normalizedAverageScore) }}</span>
      <span class="score-meta-item">处理后: {{ formatScore(indicator.processedAverageScore ||
        indicator.averageScore) }}</span>
      <span class="score-meta-item">恶意: {{ indicator.abnormalCount ?? 0 }}</span>
      <span class="score-meta-item">样本: {{ indicator.sampleSize ?? 0 }}</span>
      <span class="score-meta-item">有效: {{ indicator.validSampleSize ?? 0 }}</span>
    </div> -->
  </BaseCard>
</template>
<script setup>
import { computed } from "vue";
import { formatScore, getDisplayScore, getProgressPercentage, getScoreColor } from "../utils/scoreUtils";
const props = defineProps({
  indicator: {
    type: Object,
    required: true,
  },
  maxScores: {
    type: Object,
    required: true,
  }
})

const maxScs = computed(() => props.maxScores)
const getIndicatorMaxScore = (indicatorId) => {
  if (!indicatorId) return;
  return maxScs.value[indicatorId]?.maxScore || 0;
};
</script>
<style scoped>
.indicator-item {
  margin: 0 15px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
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

.score-value {
  font-weight: 700;
  font-size: 1.15rem;
  color: #1f2937;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.indicator-score :deep(.el-progress) {
  flex: 1;
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
</style>
