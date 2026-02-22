<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      编辑项目
    </template>
    <template #form>
      <div class="project-edit-form">
        <ProjectForm :data="props.data" :editMode="true" ref="formRef" @update:data="handleFormData"
          :disabled="disableBehavior"></ProjectForm>
      </div>
    </template>
    <template #operations>
      <button @click="handleConfirm()" class="primary-btn" :disabled="disableBehavior">保存</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import ProjectForm from './ProjectForm.vue';
import { projectApi } from '@/api/project';

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      id: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      standardId: '',
      groupIds: [],
      scorerIds: [],
      isEnabled: true,
      status: 'not_started'
    })
  }
})

const emits = defineEmits(['update:visible', 'refresh'])

const formRef = ref(null)
const disableBehavior = ref(false)
const formData = ref({})

const handleClose = () => {
  emits('update:visible', false)
}

const handleFormData = (data) => {
  formData.value = data
}

const handleConfirm = async () => {
  disableBehavior.value = true

  if (!formRef.value) {
    ElMessage.error('表单加载失败')
    disableBehavior.value = false
    return
  }

  const { valid, data } = await formRef.value.validate()

  if (valid) {
    try {
      // const response = await projectApi.editProject(data.id, data)
      // ElMessage.success(`${response.message}`)
      ElMessage.success('项目已更新')
      emits('refresh', true)
      handleClose()
    } catch (err) {
      ElMessage.error(`保存项目失败: ${err}`)
    } finally {
      disableBehavior.value = false
    }
  } else {
    ElMessage.error('请完善表单数据')
    disableBehavior.value = false
  }
}
</script>

<style scoped></style>
