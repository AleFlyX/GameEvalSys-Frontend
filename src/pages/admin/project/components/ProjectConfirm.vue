<template>
  <BaseConfirmModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      {{ data.isEnabled ? '确认启用' : '确认删除' }}
    </template>
    <template #content>
      <p>确定要<strong>{{ data.isEnabled ? '启用' : '禁用' }}</strong>项目 <strong>{{ data.name }}</strong> 吗？此操作不可撤销。</p>
    </template>
    <template #operations>
      <MyBtn :type="data.isEnabled ? 'primary' : 'danger'" :class="modalType" @click="handleConfirm()"
        :disabled="disableBtn">
        {{ data.isEnabled ? '启用' : '禁用' }}</MyBtn>
      <MyBtn type="default" @click="handleClose()">取消</MyBtn>
    </template>
  </BaseConfirmModal>
</template>
<script setup>
import MyBtn from '@/components/common/form/MyBtn.vue';
import { ref, computed } from 'vue'
import BaseConfirmModal from '@/components/common/modal/BaseConfirmModal.vue';
import { projectApi } from '@/api/project';
import { useMessage } from '@/composables/useMessage';
defineOptions({
  inheritAttrs: false
})
const props = defineProps({
  data: {
    type: Object,
    default: () => { }
  }
})

const emits = defineEmits([
  'update:visible',
  'refresh'
])

const message = useMessage();

const modalType = computed(() => props.data.isEnabled ? 'primary-btn' : 'danger-btn')

const disableBtn = ref(false);
const handleConfirm = async () => {
  disableBtn.value = true;
  try {
    const response = await projectApi.editProject(props.data.id, { isEnabled: props.data.isEnabled })
    message.success(`${response.message}`)
    emits('refresh', true)
  }
  catch (err) {
    message.error(`删除项目出错: ${err}`)
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
