<template>
  <BaseCard class="panel-card" shadow="never">
    <div class="panel-head">
      <div>
        <div class="panel-title">{{ title }}</div>
        <div class="panel-subtitle">{{ subtitle }}</div>
      </div>
      <slot name="subheader"> </slot>
    </div>
    <div class="data-list" :style="{ maxHeight: maxHeight || 'auto' }">
      <slot>

      </slot>
    </div>
  </BaseCard>
</template>
<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  maxHeight: {
    type: String,
    default: 'auto',
  },
})
</script>
<style scoped>
.panel-card {
  padding: 20px;
  background: var(--monitor-card);
  border: 1px solid var(--monitor-border);
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(10px);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--monitor-text);
}

.panel-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--monitor-sub);
}

.data-list {
  display: grid;
  gap: 12px;
  overflow-y: auto;
}
</style>
