<template>
  <BaseCard class="group-item" shadow="hover">
    <!-- 卡片主体：小组信息 + 得分进度 + 操作 -->
    <div class="group-main">
      <div class="group-info">
        <span class="group-name" :title="group.groupName">{{ group.groupName }}</span>
        <span class="group-id">#{{ group.groupId }}</span>
      </div>
      <div class="group-score">
        <el-progress :percentage="getProgressPercentage(getDisplayScore(group), totalScoreAwait)"
          :color="getScoreColor(getProgressPercentage(getDisplayScore(group), totalScoreAwait))" :stroke-width="10" />
        <span class="score-value">{{ formatScore(getDisplayScore(group)) }}</span>
        <span class="score-total">/{{ totalScoreAwait }}</span>
      </div>
      <div class="group-actions">
        <el-button type="primary" link @click="handleOpenGroupModal(group)">
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
</template>
<script setup>
import { formatScore, getDisplayScore, getProgressPercentage, getScoreColor } from '../utils/scoreUtils.js';
defineProps({
  group: {
    type: Object,
    default: () => { }
  },
  totalScoreAwait: {
    type: Number,
    default: 100
  }
})

const emits = defineEmits(['openGroupModal'])

const handleOpenGroupModal = (group) => {
  if (!group || group === null || group === undefined) return
  emits('openGroupModal', group);
}
</script>
<style scoped>
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
</style>
