<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)" width="60%" height="75%">
    <template #title>
      <span>{{ addMode ? '新增打分标准' : editMode ? '编辑打分标准' : '查看打分标准' }}</span>
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
      <ScoringStdForm v-else ref="formRef" :initData="effectiveInitData" :add-mode="addMode"
        :editable="addMode || editMode" />
    </template>
    <template #operations>
      <button v-if="addMode || editMode" @click="handleConfirm()" class="primary-btn" :disabled="isSubmitting">
        确认
      </button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';

import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ScoringStdForm from './ScoringStdForm.vue';

import { ScoringApi } from '@/api/scoring';
import { useLoading } from '@/composables/useLodaing';
import { buildScoringStandardPayload } from '@/utils/scoringStandard';

const props = defineProps({
  addMode: {
    type: Boolean,
    default: false
  },
  editMode: {
    type: Boolean,
    default: false
  },
  standardId: {
    type: Number,
    default: null
  },
  initData: {
    type: Object,
    default: () => ({})
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
const standardData = ref({ name: '', categories: [] });
const effectiveInitData = computed(() => (props.addMode ? { name: '', categories: [] } : standardData.value));

const loadStandardDetail = async (stdId) => {
  if (!stdId || props.addMode) {
    return;
  }
  startLoading();
  try {
    const response = await ScoringApi.getScoringStandardsDetails(stdId);
    standardData.value = response.data || {};
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
    const rawFormData = formRef.value.getFormData();
    const formData = buildScoringStandardPayload(rawFormData);
    if (props.addMode) {
      await ScoringApi.createScoringStandards(formData);
      ElMessage.success('打分标准创建成功');
    } else if (props.editMode) {
      await ScoringApi.updateScoringStandards(props.standardId, formData);
      ElMessage.success('打分标准更新成功');
    }
    emits('refresh', true);
    handleClose();
    formRef.value.resetFormData(); // 只在成功后重置
  } catch (err) {
    const actionName = props.addMode ? '创建' : '更新';
    ElMessage.error(`${actionName}失败: ${err.message || err}`);
  } finally {
    isSubmitting.value = false;
  }
};
watch(
  () => [props.standardId, props.addMode],
  async ([newId, addMode]) => {
    if (!addMode) {
      await loadStandardDetail(newId)
    }
  },
  { immediate: true }
);

</script>
