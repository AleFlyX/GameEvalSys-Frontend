<template>
  <el-collapse class="ai-reference">
    <el-collapse-item name="ai">
      <template #title>
        <span class="title">AI 评分参考</span>
        <el-tag v-if="score?.aiConfidence !== null && score?.aiConfidence !== undefined" size="small" type="success">
          置信度 {{ confidenceLabel }}
        </el-tag>
      </template>

      <el-empty v-if="!score" description="暂无 AI 评分结果" />
      <template v-else>
        <div class="dimension-list" v-if="score.dimensionScores?.length">
          <div v-for="dimension in score.dimensionScores" :key="dimension.dimensionId || dimension.dimensionName"
            class="dimension-row">
            <span>{{ dimension.dimensionName || dimension.name }}</span>
            <strong>{{ dimension.score }} / {{ dimension.maxScore }}</strong>
          </div>
        </div>
        <p class="comment">{{ score.comment || score.aiReasoning || '暂无 AI 说明' }}</p>
        <el-button type="primary" plain size="small" @click="$emit('adopt', score)">采纳 AI 评分</el-button>
      </template>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: { type: Object, default: null }
});

defineEmits(['adopt']);

const confidenceLabel = computed(() => `${Math.round(Number(props.score?.aiConfidence || 0) * 100)}%`);
</script>

<style scoped>
.ai-reference {
  border-radius: 8px;
  overflow: hidden;
}

.title {
  margin-right: 10px;
  font-weight: 600;
}

.dimension-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.dimension-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.comment {
  color: var(--text-secondary);
  line-height: 1.7;
}
</style>
