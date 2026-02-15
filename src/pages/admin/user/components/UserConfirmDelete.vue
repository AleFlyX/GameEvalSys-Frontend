<template>
  <BaseConfirmModal @clickMaskToClose="handleClose()" v-model:visible="dialogVisible">
    <template #title>
      确认删除?
    </template>
    <template #content>
      用户: {{ props.data.name }},id: {{ props.data.id }}
    </template>
    <template #operations>
      <button @click="handleConfirm()">确认</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseConfirmModal>
</template>
<script setup>
import { ref, watch } from 'vue'
import BaseConfirmModal from '@/components/common/modal/BaseConfirmModal.vue';
import { userApi } from '@/api/user'
import { ElMessage } from 'element-plus';
const props = defineProps({
  visible: {
    type: Boolean,
    require: true,
    default: false
  },
  data: {
    type: Object,
    default: () => {
      return {
        name: 'empty name',
        id: 'empty id'
      }
    }
  }
})
// 定义本地响应式变量，初始值同步 props.visible
const dialogVisible = ref(props.visible)
// 监听 props.visible 变化，同步到本地变量（父组件修改时，子组件跟着变）
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})
// 监听本地变量变化，触发 update:visible 通知父组件（子组件修改时，同步给父组件）
watch(dialogVisible, (newVal) => {
  emits('update:visible', newVal)
})

const emits = defineEmits([
  'confirm',
  'close'
])
// console.log(props.data)
const handleConfirm = async () => {
  console.log('UserConfirmDelete Emit CONFIRM')
  ElMessage.success(`deleting ${props.data.id}`)
  emits('confirm', true)
  // try {
  //   const response = await userApi.deleteUser(waitToDelete.value.id)
  //   ElMessage.success(response.message)
  //   showDeleteUserDialog.value = false;
  // }
  // catch (err) {
  //   ElMessage.error(err)
  //   console.log(err)
  // }
}
const handleClose = () => {
  console.log('UserConfirmDelete Emit CLOSE')
  emits('close', true)
}
</script>
