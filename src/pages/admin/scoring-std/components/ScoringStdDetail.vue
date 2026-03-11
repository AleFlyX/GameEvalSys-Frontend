<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      <span>查看打分标准详情</span>
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
      <ScoringStdForm v-else ref="formRef" :initData="standardData" />
    </template>
    <template #operations>
      <!-- 目前仅支持查看，如后期API支持编辑可取消注释 -->
      <!-- <button @click="handleConfirm()" class="primary-btn" :disabled="isSubmitting">保存</button> -->
      <button @click="handleClose()">关闭</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';

import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ScoringStdForm from './ScoringStdForm.vue';

import { ScoringApi } from '@/api/scoring';

defineOptions({
  inheritAttrs: false
});

const props = defineProps({
  standardId: {
    type: Number,
    default: null
  }
});

const emits = defineEmits(['update:visible', 'refresh']);

const formRef = ref(null);
const loading = ref(false);
const isSubmitting = ref(false);
const standardData = ref({
  indicators: []
});

// 加载打分标准详情
const loadStandardDetail = async () => {
  if (!props.standardId) return;

  loading.value = true;
  try {
    const response = await ScoringApi.getScoringStandardsDetails(props.standardId);
    standardData.value = response.data || { indicators: [] };
  } catch (err) {
    ElMessage.error(`加载打分标准失败: ${err.message || err}`);
  } finally {
    loading.value = false;
  }
};

// 监听standardId变化
watch(() => props.standardId, () => {
  if (props.standardId) {
    loadStandardDetail();
  }
});

const handleClose = () => {
  emits('update:visible', false);
};

// 保存编辑（目前不实现，等API支持）
const handleConfirm = async () => {
  ElMessage.info('编辑功能开发中');
};

onMounted(() => {
  if (props.standardId) {
    loadStandardDetail();
  }
});
</script>
