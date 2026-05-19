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
        <BaseCard v-for="task in pendingTasks" :key="task.id" variant="soft" interactive
          @click="JumpToScoring(task.id)">
          <div class="task-item">
            <span class="task-dot"></span>
            <div class="task-content">
              <p class="task-name">{{ task.name }}</p>
              <p class="task-deadline">{{ task.deadline }}</p>
            </div>
          </div>
        </BaseCard>
      </div>
    </template>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/common/data/BaseCard.vue';
import { useRouter } from 'vue-router';
const props = defineProps({
  pendingTasks: {
    type: Array,
    default: () => []
  },
  focusProjectName: {
    type: String,
    default: '暂无项目'
  },
  focusProjectId: {
    type: [String, Number],
    default: null
  }
});

const router = useRouter();
const JumpToScoring = (groupId) => {
  // 实现跳转到评分页面的逻辑
  router.push({
    name: 'projectScoring',
    params: { projectId: props.focusProjectId },
    query: { projectName: props.focusProjectName },
    state: {
      groupId: groupId,
      openModal: true,
    }
  });
};
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
