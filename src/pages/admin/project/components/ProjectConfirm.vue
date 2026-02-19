<template>
  <BaseConfirmModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      确认删除?
    </template>
    <template #content>
      项目: {{ props.data.name }} id: {{ props.data.id }}
    </template>
    <template #operations>
      <button class="primary-btn" @click="handleConfirm()" :disabled="disableBtn">确认</button>
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
        id: 'empty id',
        description: 'empty description'
      }
    }
  }
})

const emits = defineEmits([
  'update:visible'
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


// console.log(props.data)
const disableBtn = ref(false);
const handleConfirm = async () => {
  ElMessage.info(`正在删除 ${props.data.name}`);
  disableBtn.value = true;

  try {
    const response = await projectApi.deleteProject(props.data.id)
    ElMessage.success(response.message)
    // emits('close', true)
  }
  catch (err) {
    ElMessage.error(err)
    console.log(err)
  }
  finally {
    // dialogVisible.value = false;
    emits('update:visible', false)
    disableBtn.value = false;
  }
}
const handleClose = () => {
  // console.log('UserConfirmDelete Emit CLOSE')
  // dialogVisible.value = false;
  emits('update:visible', false)
}
</script>
