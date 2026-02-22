<template>
  <BaseConfirmModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      删除项目
    </template>
    <template #content>
      <p>确定要删除项目 <strong>{{ props.data.name }}</strong> 吗？此操作不可撤销。</p>
    </template>
    <template #operations>
      <button class="primary-btn" @click="handleConfirm()" :disabled="disableBtn">删除</button>
      <button class="cancel-btn" @click="handleClose()">取消</button>
    </template>
  </BaseConfirmModal>
</template>
<script setup>
import { ref } from 'vue'
import BaseConfirmModal from '@/components/common/modal/BaseConfirmModal.vue';
import { projectApi } from '@/api/project';
import { ElMessage } from 'element-plus';

defineOptions({
  inheritAttrs: false
})
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {
        name: '未命名项目',
        id: '',
        description: ''
      }
    }
  }
})

const emits = defineEmits([
  'update:visible',
  'refresh'
])

const disableBtn = ref(false);
const handleConfirm = async () => {
  ElMessage.info(`正在删除 ${props.data.name}`);
  disableBtn.value = true;

  try {
    const response = await projectApi.deleteProject(props.data.id)
    emits('refresh', true)
  }
  catch (err) {
    ElMessage.error(`删除项目出错: ${err}`)
    console.log(err)
  }
  finally {
    // dialogVisible.value = false;
    emits('update:visible', false)
    disableBtn.value = false;
  }
}
const handleClose = () => {
  emits('update:visible', false)
}
</script>
