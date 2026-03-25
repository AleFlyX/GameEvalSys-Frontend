<template>
  <!-- 查看打分详情 -->
  <BaseModal v-model:visible="showScoringDetailDialog" :allow-mask-close="false">
    <template #layout>
      <div class="scoring-detail-container">
        <div class="modal-title">
          <h3>{{ selectedGroup?.name }} - 打分详情</h3>
        </div>
        <div class="modal-body">
          <div v-if="selectedGroup" class="scoring-detail">
            <div class="detail-item" v-for="indicator in scoringDetails" :key="indicator.id">
              <label>{{ indicator.name }}:</label>
              <span class="score-value">{{ indicator.score }}</span>
              <span class="score-range">({{ indicator.minScore }} - {{ indicator.maxScore }})</span>
            </div>
            <div class="total-score">
              <label>总分:</label>
              <span>{{ totalScore }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <el-button @click="showScoringDetailDialog = false">关闭</el-button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import BaseModal from '@/components/common/modal/BaseModal.vue';
const props = defineProps({
  selectedGroup: {
    type: Object,
    default: () => ({})
  },
  scoringDetails: {
    type: Object,
    default: () => ({})
  },
  totalScore: {
    type: [Number, String],
    default: 0
  }
})

// todo:将评分标准做个缓存机制？？ 然后按照 kv结构：id-indicatorName 读取
onMounted(() => {
  console.log("6465465465456", props.selectedGroup, props.scoringDetails)
})

</script>
