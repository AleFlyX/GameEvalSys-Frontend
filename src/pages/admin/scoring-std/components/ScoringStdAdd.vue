<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      <span>新增打分标准</span>
    </template>
    <template #form>
      <ScoringStdForm ref="formRef" :initData="{}" add-mode />
    </template>
    <template #operations>
      <button @click="handleConfirm()" class="primary-btn" :disabled="isSubmitting">确认</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ScoringStdForm from './ScoringStdForm.vue';

import { ScoringApi } from '@/api/scoring';

defineOptions({
  inheritAttrs: false
});

const emits = defineEmits(['update:visible', 'refresh']);

const formRef = ref(null);
const isSubmitting = ref(false);

const handleClose = () => {
  emits('update:visible', false);
};

const handleConfirm = async () => {
  try {
    // 校验表单
    const isValid = await formRef.value.validate();
    if (!isValid) return;

    isSubmitting.value = true;

    // 获取表单数据
    const formData = formRef.value.getFormData();

    // 调用API创建打分标准
    const response = await ScoringApi.createScoringStandards(formData);

    ElMessage.success('打分标准创建成功');
    handleClose();
    emits('refresh', true);
  } catch (err) {
    ElMessage.error(`创建失败: ${err.message || err}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
