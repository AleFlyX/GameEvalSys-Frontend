<template>
  <section class="stats-grid">
    <StatCard label="总提交" :value="stats.total" icon="Document" icon-bg="var(--primary-light)"
      icon-color="var(--primary-havy)" />
    <StatCard label="待评分" :value="stats.pending" icon="Clock" icon-bg="var(--warning-light)"
      icon-color="var(--warning)" />
    <StatCard label="已评分" :value="stats.scored" icon="Checked" icon-bg="var(--success-light)"
      icon-color="var(--success)" />
    <StatCard label="平均分" :value="averageLabel" icon="DataAnalysis" icon-bg="var(--danger-light)"
      icon-color="var(--danger)" />
  </section>
</template>

<script setup>
import { computed } from 'vue';

import StatCard from '@/components/common/data/StatCard.vue';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({ total: 0, pending: 0, scored: 0, averageScore: null })
  }
});

const averageLabel = computed(() => {
  const value = Number(props.stats.averageScore);
  return Number.isFinite(value) ? value.toFixed(1) : '-';
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
</style>
