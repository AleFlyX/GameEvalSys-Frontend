<template>
  <button class="page-back-content" @click="handleClick" title="返回上一页">
    <el-icon>
      <ArrowLeft />
    </el-icon>
    <span>
      <slot>返回</slot>
    </span>
  </button>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'BackButton'
});

const props = defineProps({
  // 如果提供了 custom handler，则不使用默认的 router.back()
  customHandler: {
    type: Function,
    default: null
  }
});

const router = useRouter();
const emit = defineEmits(['click']);

const handleClick = (e) => {
  emit('click', e);
  if (props.customHandler) {
    props.customHandler(e);
  } else {
    router.back();
  }
};
</script>

<style scoped>
.page-back-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  height: auto;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 99px;
  background-color: var(--bg-secondary, #f9fafb);
  color: var(--text-primary, #111827);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-right: 0;
}

.page-back-content:hover {
  background-color: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary, #409eff);
}

html[data-theme="dark"] .page-back-content {
  background-color: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
}

html[data-theme="dark"] .page-back-content:hover {
  background-color: rgba(64, 158, 255, 0.15);
  /* var(--el-color-primary-light-9) in dark */
  color: #409eff;
}
</style>
