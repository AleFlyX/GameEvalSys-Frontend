<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)" :allow-mask-close="false">
    <template #title>
      创建项目
    </template>
    <template #form>
      <div class="project-add-form">
        <ProjectForm :data="initialFormData" :editMode="false" ref="formRef" :disabled="disableBehavior">
        </ProjectForm>
      </div>
    </template>
    <template #operations>
      <button @click="handleConfirm()" class="primary-btn" :disabled="disableBehavior">创建</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref } from 'vue';
import { useMessage } from '@/composables/useMessage';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ProjectForm from './ProjectForm.vue';
import { projectApi } from '@/api/project';

defineOptions({
  inheritAttrs: false
})

const emits = defineEmits(['update:visible', 'refresh'])

const message = useMessage();

const initialFormData = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  standardId: '',
  groupIds: [],
  scorerIds: [],
  isEnabled: true
}

const formRef = ref(null)
const disableBehavior = ref(false)

const handleClose = () => {
  emits('update:visible', false)
}

const handleConfirm = async () => {
  disableBehavior.value = true

  if (!formRef.value) {
    message.error('表单加载失败')
    disableBehavior.value = false
    return
  }

  const { valid, data } = await formRef.value.validate()
  console.log('项目添加ADDDDing', data)
  if (valid) {
    try {
      const response = await projectApi.createProject(data)
      message.success(`${response.message}`)
      emits('refresh', true)
      handleClose()
    } catch (err) {
      message.error(`创建项目失败: ${err?.message}`)
    } finally {
      disableBehavior.value = false
    }
  } else {
    message.error('请完善表单数据')
    disableBehavior.value = false
  }
}
</script>

<style scoped></style>
