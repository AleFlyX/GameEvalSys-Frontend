<template>
  <div class="detail-item">
    <div class="indicator-meta">
      <label>{{ indicator.name }}</label>
      <span class="score-range">分值范围 {{ indicator.minScore }} - {{ indicator.maxScore }}</span>
    </div>
    <div class="score-value">{{ indicator.score }}</div>
  </div>
</template>

<script setup>
defineProps({
  indicator: { type: Object, default: () => ({}) }
});
</script>

<style scoped>
.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5ebf3;
}

.indicator-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.indicator-meta label {
  font-weight: 600;
  color: #1f2a44;
}

.score-range {
  font-size: 12px;
  color: #8a97aa;
}

.score-value {
  flex: 0 0 auto;
  min-width: 72px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(47, 107, 255, 0.1);
  color: var(--primary);
  font-weight: 700;
  font-size: 16px;
  text-align: center;
}

@media (max-width: 768px) {
  .detail-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .score-value {
    min-width: 64px;
  }
}
</style>
