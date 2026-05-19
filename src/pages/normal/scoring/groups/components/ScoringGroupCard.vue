<template>
  <BaseCard v-for="group in groups" :key="group.id" :card-style="GROUP_CARD_STYLES_MAP[group.scoreStatus]"
    :body-style="BODY_STYLE" interactive shadow="hover">
    <div class="group-card-main">
      <div class="group-card-basic">
        <div>
          <div class="group-id">小组 ID · {{ group.id }}</div>
          <h4>{{ group.name }}</h4>
        </div>
      </div>
    </div>
    <div class="group-card-actions">
      <el-tag effect="light" round :type="getScoreStatusTag(group.scoreStatus)">
        {{ formatScoreStatus(group.scoreStatus) }}
      </el-tag>
      <el-button type="primary" @click="handleScoring(group)">
        {{ group.scoreStatus === 'scored' ? '重新评分' : '开始评分' }}
      </el-button>
      <el-button v-if="group.scoreStatus === 'scored'" @click="handleViewScore(group)">
        查看评分
      </el-button>
    </div>
  </BaseCard>
</template>
<script setup>
import { useHandleDataStatus } from '../composables/useHandleDataStatus';
import BaseCard from '@/components/common/data/BaseCard.vue';
defineProps({
  groups: {
    type: Array,
    required: true
  },
  filterStatus: {
    type: String,
    default: 'all'
  }
});
const emit = defineEmits(['score', 'view-score']);

const BASIC_CARD = {
  'border-radius': '24px',
  'border': '1px solid #e6edf7',
  'padding': '22px 24px',
}
const GROUP_CARD_STYLES_MAP = {
  'not_scored': {
    ...BASIC_CARD,
    'border-color': 'rgba(47, 107, 255, 0.24)',
  },
  'scored': {
    ...BASIC_CARD,
    'border-color': 'rgba(34, 197, 94, 0.2)',
  }
}

const BODY_STYLE = {
  'display': 'flex',
  'flex-direction': 'row',
  'flex-wrap': 'wrap',
  'align-items': 'center',
  'justify-content': 'space-between',
  'gap': '20px',
}

const { formatScoreStatus, getScoreStatusTag } = useHandleDataStatus();
const handleScoring = (group) => {
  emit('score', group);
};
const handleViewScore = (group) => {
  emit('view-score', group);
};
</script>
<style scoped>
.group-card-main {
  display: flex;
  flex: 1;
  gap: 16px;
  min-width: 0;
}

.group-card-basic {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.group-id {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.group-card-basic h4 {
  margin: 0;
  font-size: 22px;
  line-height: 1.4;
  color: var(--text);
  word-break: break-word;
}

.group-card-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 220px));
  gap: 12px;
}

.group-card-actions {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-shrink: 0;
}

.group-card-actions .el-button {
  min-width: 104px;
}

@media (max-width:960px) {
  .group-card-actions {
    width: 100%;
  }

  .group-card-actions .el-button {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .group-card-main {
    flex-direction: column;
    align-items: stretch;
  }

  .group-card-meta {
    grid-template-columns: 1fr;
  }

  .group-card-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .group-card-actions .el-button {
    min-width: unset;
    padding: 6px 16px;
  }
}
</style>
