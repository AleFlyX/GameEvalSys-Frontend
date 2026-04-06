<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      <span>{{ addMode ? '新增打分标准' : '查看打分标准' }}</span>
    </template>
    <template #form>
      <div v-if="loading" style="text-align: center; padding: 40px;">
        <el-icon class="is-loading" style="font-size: 24px;">
          <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path fill="currentColor"
              d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 64a384 384 0 1 0 0 768 384 384 0 0 0 0-768zm0 64a320 320 0 1 1 0 640 320 320 0 0 1 0-640zm0 64a256 256 0 1 0 0 512 256 256 0 0 0 0-512zm0 64a192 192 0 1 1 0 384 192 192 0 0 1 0-384z" />
          </svg>
        </el-icon>
        <p>加载中...</p>
      </div>
      <ScoringStdForm v-else ref="formRef" :initData="addMode ? { name: '', indicators: [] } : standardData"
        :add-mode="addMode" />
    </template>
    <template #operations>
      <button v-if="addMode" @click="handleConfirm()" class="primary-btn" :disabled="isSubmitting">确认</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ScoringStdForm from './ScoringStdForm.vue';

import { ScoringApi } from '@/api/scoring';
import { useLoading } from '@/composables/useLodaing';

const props = defineProps({
  addMode: {
    type: Boolean,
    default: false
  },
  standardId: {
    type: Number,
    default: null
  }
})

defineOptions({
  inheritAttrs: false
});

const emits = defineEmits(['update:visible', 'refresh']);

const formRef = ref(null);
const isSubmitting = ref(false);

const handleClose = () => {
  emits('update:visible', false);
};

const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('scoringStd:detail');
const standardData = ref({ name: '', indicators: [] })
const loadStandardDetail = async (stdId) => {
  if (!stdId || props.addMode) {
    return;
  }
  startLoading();
  try {
    const response = await ScoringApi.getScoringStandardsDetails(stdId);
    standardData.value = response.data || {};
    console.log(response.data)

  } catch (err) {
    ElMessage.error(`加载打分标准失败: ${err.message || err}`);
  } finally {
    endLoading();
  }
};

const handleConfirm = async () => {
  try {
    // 校验表单
    const isValid = await formRef.value.validate();
    if (!isValid) return;

    isSubmitting.value = true;

    // 获取表单数据
    const formData = formRef.value.getFormData();
    console.log(formData)
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
watch(() => props.standardId, async (newId) => {
  console.log(newId)
  await loadStandardDetail(newId)
})

</script>
