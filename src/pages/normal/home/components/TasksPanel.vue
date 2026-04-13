<template>
  <BaseCard shadow="hover">
    <template #header>
      <slot name="header"></slot>
    </template>
    <template #body>
      <div class="task-list">
        <div v-if="pendingTasks.length === 0" class="task-empty">
          当前没有待处理任务
        </div>
        <div v-for="task in pendingTasks" :key="task.id" class="task-item">
          <span class="task-dot"></span>
          <div class="task-content">
            <p class="task-name">{{ task.name }}</p>
            <p class="task-deadline">{{ task.deadline }}</p>
          </div>
        </div>
      </div>
    </template>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/common/data/BaseCard.vue';

defineProps({
  pendingTasks: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-empty {
  padding: 28px 12px;
  text-align: center;
  color: #8a97aa;
  font-size: 13px;
  border: 1px dashed #dce6f4;
  border-radius: 12px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: #f7fbff;
}

.task-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #409eff;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-name {
  margin: 0;
  font-size: 13px;
  color: #1f2f46;
}

.task-deadline {
  margin: 4px 0 0;
  font-size: 12px;
  color: #7d8da2;
}
</style>
