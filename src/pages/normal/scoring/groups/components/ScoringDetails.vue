<template>
  <!-- 查看打分详情 -->
  <BaseDialogModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #header>
      <h3>{{ selectedGroup?.name }} - 打分详情</h3>
    </template>
    <template #body>
      <div v-if="selectedGroup" class="scoring-detail">
        <div class="detail-item" v-for="indicator in scoringDetailsRes" :key="indicator.id">

          <label>{{ indicator.name }}: </label>
          <span class="score-value"><strong>{{ indicator.score }}</strong></span>
          <span class="score-range">--分值范围({{ indicator.minScore }} - {{ indicator.maxScore }})</span>
        </div>
        <div class="total-score">
          <label>总分:</label>
          <span style="color: red;"> <strong>{{ totalScore }}</strong></span>
        </div>
      </div>
    </template>
    <template #footer>
      <button @click="$emit('update:visible', false)">关闭</button>
    </template>
  </BaseDialogModal>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue';
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

const scoringDetailsRes = ref({})
watch(
  () => [props.scoringDetails, props.scoringStdDetails],
  ([newScoringDetails, newScoringStdDetails]) => {
    console.error('CHANGED DATA ', newScoringStdDetails, newScoringDetails)
    if (newScoringStdDetails && newScoringDetails) {
      scoringDetailsRes.value = newScoringStdDetails.indicators.map((item, index) => {
        item['score'] = newScoringDetails[index].score;
        console.log(item, index, newScoringDetails[index].score)
        return item;
      })
      console.log(scoringDetailsRes.value)
    }
  },
  // { immediate: true }
)
const handleScoringCacheMatchToStd = () => {

}

onMounted(() => {
  console.log("6465465465456", props.selectedGroup, props.scoringDetails)
})

</script>
<style scoped>
.scoring-detail {
  padding: 12px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

.detail-item label {
  font-weight: 600;
  min-width: 100px;
  margin-right: 20px;
}

.score-value {
  color: var(--primary);
  font-weight: 600;
  font-size: 16px;
  margin: 0 10px;
}

.score-range {
  color: #909399;
  font-size: 12px;
}

.total-score {
  display: flex;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  align-items: center;
}

.total-score label {
  font-weight: 600;
  min-width: 100px;
  margin-right: 20px;
}

.total-score span {
  color: var(--danger);
  font-weight: 600;
  font-size: 18px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
