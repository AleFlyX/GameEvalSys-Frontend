<template>
  <BaseConfirmModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      {{ props.title }}
    </template>
    <template #content>
      用户: {{ props.data.name }} id: {{ props.data.id }}
    </template>
    <template #operations>
      <button class="primary-btn" @click="handleConfirm()" :disabled="props.disableBtn">确认</button>
      <button class="cancel-btn" @click="handleClose()">取消</button>
    </template>
  </BaseConfirmModal>
</template>
<script setup>
import BaseConfirmModal from '@/components/common/modal/BaseConfirmModal.vue';
import { ElMessage } from 'element-plus';

defineOptions({
  inheritAttrs: false
})
const props = defineProps({
  title: {
    type: String,
    default: '继续操作？'
  },
  // visible: {
  //   type: Boolean,
  //   require: true,
  //   default: false
  // },
  data: {
    type: Object,
    default: () => {
      return {
        name: 'empty name',
        id: 'empty id'
      }
    }
  },
  disableBtn: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits([
  'update:visible',
  'confirm'
])
// 定义本地响应式变量，初始值同步 props.visible
// const dialogVisible = ref(props.visible)
// // 监听 props.visible 变化，同步到本地变量（父组件修改时，子组件跟着变）
// watch(() => props.visible, (newVal) => {
//   dialogVisible.value = newVal
// })
// // 监听本地变量变化，触发 update:visible 通知父组件（子组件修改时，同步给父组件）
// watch(dialogVisible, (newVal) => {
//   emits('update:visible', newVal)
// })

/**
 * 新思路：确认之后执行传入的callback函数
 */
const handleConfirm = async () => {
  // ElMessage.info(`正在删除 ${props.data.name}`);
  const tmpId = props.data.id;
  emits('confirm', tmpId)
}
const handleClose = () => {
  emits('update:visible', false)
}
</script>
