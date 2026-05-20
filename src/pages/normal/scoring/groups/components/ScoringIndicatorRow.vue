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
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e5ebf3;
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: #f0f4fa;
  border-color: #d8e1f0;
}

.indicator-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.indicator-meta label {
  font-weight: 600;
  font-size: 15px;
  color: #1f2a44;
  line-height: 1.3;
}

.score-range {
  font-size: 12px;
  color: #8a97aa;
  line-height: 1.4;
}

.score-value {
  flex: 0 0 auto;
  min-width: 80px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(47, 107, 255, 0.1);
  color: var(--primary, #2f6bff);
  font-weight: 700;
  font-size: 17px;
  text-align: center;
  line-height: 1;
}

@media (max-width: 768px) {
  .detail-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .indicator-meta {
    width: 100%;
  }

  .score-value {
    min-width: auto;
    text-align: left;
    padding: 8px 12px;
    font-size: 16px;
  }
}
</style>
