<template>
  <BaseConfirmModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      {{ title }}
    </template>
    <template #content>
      <p>确定要 {{ keywords }} 评审团 <strong>{{ props.data.name }}</strong> 吗？</p>
    </template>
    <template #operations>
      <MyBtn type="primary"  @click="handleConfirm()" :disabled="disableBtn">确认</MyBtn>
      <MyBtn type="default"  @click="handleClose()">取消</MyBtn>
    </template>
  </BaseConfirmModal>
</template>
<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import { ref } from 'vue'
import BaseConfirmModal from '@/components/common/modal/BaseConfirmModal.vue';
import { reviewerGroupApi } from '@/api/reviewer-group';
import { ElMessage } from 'element-plus';

defineOptions({
  inheritAttrs: false
})
const props = defineProps({
  title: {
    type: String,
    default: '空标题'
  },
  keywords: {
    type: String,
    default: '空内容'
  },
  data: {
    type: Object,
    default: () => {
      return {
        name: '未命名评审团',
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
  disableBtn.value = true;
  try {
    const response = await reviewerGroupApi.deleteReviewerGroup(props.data.id)
    emits('refresh', response)
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
