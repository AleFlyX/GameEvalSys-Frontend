<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)" :allow-mask-close="false">
    <template #title>
      <ScoringModalHeader :title="`${projectName} - ${groupData.name} - 打分`"
        description="提交前请确认当前评分任务与小组信息，评分完成后会立即回到任务列表。" />
    </template>
    <template #form>
      <div class="scoring-form-modal">
        <section class="task-context-panel">
          <div class="context-item">
            <span>项目</span>
            <strong>{{ projectName }}</strong>
          </div>
          <div class="context-item">
            <span>小组</span>
            <strong>{{ groupData.name }}</strong>
          </div>
        </section>

        <ScoringForm ref="scoringFormRef" v-bind="$attrs" :disabled="disableBehavior" :project-id="props.projectId"
          :group-id="groupData.id">
        </ScoringForm>
      </div>
    </template>
    <template #operations>
      <MyBtn type="primary" @click="handleConfirm()" :disabled="disableBehavior">提交评分</MyBtn>
      <MyBtn @click="handleClose()">取消</MyBtn>
    </template>
  </BaseFormModal>
</template>
<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import { ref } from 'vue';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ScoringForm from './ScoringForm.vue';
import ScoringModalHeader from './ScoringModalHeader.vue';
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

<style scoped>
.scoring-form-modal {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.task-context-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(47, 107, 255, 0.08), rgba(32, 183, 199, 0.08));
  border: 1px solid rgba(47, 107, 255, 0.12);
  border-radius: 14px;
}

.context-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.context-item span {
  font-size: 12px;
  font-weight: 500;
  color: #7b8798;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.context-item strong {
  color: #1f2a44;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}

@media (max-width: 768px) {
  .scoring-form-modal {
    gap: 16px;
  }

  .task-context-panel {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 14px 16px;
  }

  .context-item strong {
    font-size: 15px;
  }
}
</style>
