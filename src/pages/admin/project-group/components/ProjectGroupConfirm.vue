<template>
  <!-- 删除确认 -->
  <BaseConfirmModal v-model:visible="showDeleteDialog" title="确认删除" :keywords="deleteKeywords" @confirm="confirmDelete">

  </BaseConfirmModal>
</template>
<script setup>
import { BaseConfirmModal } from '@/components/common/modal/BaseConfirmModal.vue';
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  keywords: {
    type: String,
    default: ''
  }
})
defineEmits([
  'confirm'
])
</script>
