<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)" :allow-mask-close="false">
    <template #title>
      {{ projectName }} - {{ groupData.name }} - 打分
    </template>
    <template #form>
      <ScoringForm ref="scoringFormRef" v-bind="$attrs" :disabled="disableBehavior" :project-id="props.projectId"
        :group-name="groupData.name" :group-id="groupData.id">
      </ScoringForm>
    </template>
    <template #operations>
      <button @click="handleConfirm()" class="primary-btn" :disabled="disableBehavior">提交评分</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>
</template>
<script setup>
import { ref } from 'vue';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ScoringForm from './ScoringForm.vue';
const props = defineProps({
  projectName: {
    type: String,
    default: '',
  },
  projectId: {
    type: [String, Number],
    default: 0
  },
  groupData: {
    type: Object,
    default: () => ({})
  }

});
const emits = defineEmits(['update:visible'])
const handleClose = () => {
  emits('update:visible', false)
}
const scoringFormRef = ref(null)
const disableBehavior = ref(false)
const handleConfirm = async () => {
  disableBehavior.value = true;
  try {
    // console.log(scoringFormRef.value)
    await scoringFormRef.value.submit();

    handleClose();
  } catch (err) {
    console.log(err)
  } finally {
    disableBehavior.value = false;
  }

}

</script>
