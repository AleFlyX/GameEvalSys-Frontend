<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)" :allow-mask-close="false">
    <template #title>
      <div class="form-modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑评审组' : '创建评审组' }}</h3>
        </div>
      </div>
    </template>

    <template #form>
      <ReviewerGroupForm ref="formRef" :init-data="formData" label-width="100px" style="width:600px;">
      </ReviewerGroupForm>
    </template>

    <template #operations>
      <div class="modal-footer">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button class="primary-btn" type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </button>
      </div>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { reviewerGroupApi } from '@/api/reviewer-group';

import { ElMessage } from 'element-plus';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ReviewerGroupForm from './ReviewerGroupForm.vue';
import { useLoading } from '@/composables/useLodaing';

const props = defineProps({
  editData: {
    type: Object,
    default: () => { }
  }
});

const emit = defineEmits(['update:visible', 'refresh']);

const formRef = ref(null);
const isEdit = computed(() => !!props.editData);
const formData = computed(() => {
  return props.editData;
})

const { isLoading: submitLoading, start: startSubmitLoading, end: endSubmitLoading } = useLoading('reviewerGroup:submit');
// 处理提交
const handleSubmit = async () => {

  const { valid, data } = await formRef.value.validate();
  if (!valid) {
    return;
  }

  startSubmitLoading();
  try {
    if (isEdit.value) {
      // 编辑
      await reviewerGroupApi.editReviewerGroup(props.editData.id, data);
      ElMessage.success('更新成功');
    } else {
      // 创建
      await reviewerGroupApi.createReviewerGroup(data);
      ElMessage.success('创建成功');
    }
    emit('update:visible', false);
    emit('refresh');
  } catch (error) {
    ElMessage.error((isEdit.value ? '更新' : '创建') + '失败: ' + error);
    console.error('Error:', error);
  } finally {
    endSubmitLoading();
  }
};

// 处理取消
const handleCancel = () => {
  emit('update:visible', false);
  // formRef.value?.resetFields();
};
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>
