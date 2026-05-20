<template>
  <!-- 查看打分详情 -->
  <BaseDialogModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #header>
      <ScoringModalHeader :title="`${selectedGroup?.name || ''} - 打分详情`" description="按当前评分标准展示每项指标的得分与范围。" />
    </template>
    <template #body>
      <div v-if="selectedGroup" class="scoring-detail">
        <section class="score-summary-card">
          <span class="summary-label">总分</span>
          <strong class="summary-value">{{ totalScore }}</strong>
        </section>

        <div class="indicator-list">
          <ScoringIndicatorRow v-for="indicator in scoringDetailsRes" :key="indicator.id" :indicator="indicator" />
        </div>
      </div>
      <div v-else class="empty-state">
        暂无打分详情
      </div>
    </template>
    <template #footer>
      <MyBtn type="default" @click="$emit('update:visible', false)">关闭</MyBtn>
    </template>
  </BaseDialogModal>
</template>
<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import { ref, watch } from 'vue';
import { getIndicatorsFromStandard } from '@/utils/scoringStandard';
import ScoringModalHeader from './ScoringModalHeader.vue';
import ScoringIndicatorRow from './ScoringIndicatorRow.vue';
const props = defineProps({
  selectedGroup: {
    type: Object,
    default: () => ({})
  },
  scoringDetails: {
    type: Object,
    default: () => ({})
  },
  scoringStdDetails: {
    type: Object,
    default: () => ({})
  },
  totalScore: {
    type: [Number, String],
    default: 0
  }
})
defineEmits(['update:visible'])
// todo:将评分标准做个缓存机制？？ 然后按照 kv结构：id-indicatorName 读取

const scoringDetailsRes = ref([])
watch(
  () => [props.scoringDetails, props.scoringStdDetails],
  ([newScoringDetails, newScoringStdDetails]) => {
    const scoreItems = Array.isArray(newScoringDetails)
      ? newScoringDetails
      : (Array.isArray(newScoringDetails?.scores) ? newScoringDetails.scores : []);
    const standardIndicators = getIndicatorsFromStandard(newScoringStdDetails);

    if (!standardIndicators.length || !scoreItems.length) {
      scoringDetailsRes.value = [];
      return;
    }

    const scoreMap = new Map(
      scoreItems.map((item) => [Number(item?.indicatorId), Number(item?.score ?? 0)])
    );

    scoringDetailsRes.value = standardIndicators.map((indicator, index) => {
      const indicatorId = Number(indicator?.id);
      const mappedScore = scoreMap.get(indicatorId);

      return {
        ...indicator,
        score: Number.isFinite(mappedScore)
          ? mappedScore
          : Number(scoreItems[index]?.score ?? 0),
      };
    });
  },
  { immediate: true }
)
</script>
<style scoped>
.scoring-detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 0 0;
}

.score-summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(47, 107, 255, 0.08), rgba(32, 183, 199, 0.08));
  border: 1px solid rgba(47, 107, 255, 0.12);
}

.summary-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #55637a;
}

.summary-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: #e53935;
  letter-spacing: -0.5px;
}

.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: #7b8798;
  font-size: 14px;
}

@media (max-width: 768px) {
  .scoring-detail {
    gap: 16px;
  }

  .score-summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-value {
    font-size: 28px;
  }
}
</style>
