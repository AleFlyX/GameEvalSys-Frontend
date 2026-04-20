<template>
  <BaseFormModal :visible="visible" @update:visible="$emit('update:visible', $event)" width="550px" min-height="65%">
    <template #title>
      <span v-if="isEditMode">{{ title }}</span>
      <el-switch v-else v-model="multiAddMode" active-text="批量添加" inactive-text="单用户添加" size="large"></el-switch>
    </template>

    <template #form>
      <div v-if="isEditMode || !multiAddMode" class="user-form-wrapper">
        <UserForm ref="formRef" :init-data="initData" :edit-mode="isEditMode">
        </UserForm>
      </div>

      <div v-else class="user-multi-add">
        <UserMultiAddForm ref="multiAddFormRef"></UserMultiAddForm>
      </div>
    </template>

    <template #operations>
      <button @click="handleConfirm" class="primary-btn" :disabled="submitting">
        {{ isEditMode ? '保存' : '确认' }}
      </button>
      <button @click="closeFormModal" :disabled="submitting">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { computed, watch } from 'vue'

import BaseFormModal from '@/components/common/modal/BaseFormModal.vue'

import UserForm from '@/components/business/user/user-form/UserForm.vue'
import UserMultiAddForm from './UserMultiAddForm.vue'

import { useUserForm } from '../composables/useUserForm'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'create'
  },
  title: {
    type: String,
    default: '新增用户'
  },
  initData: {
    type: Object,
    default: () => ({})
  }
})

const emits = defineEmits(['update:visible', 'refresh'])

const modeRef = computed(() => props.mode)
const {
  formRef,
  multiAddFormRef,
  multiAddMode,
  submitting,
  isEditMode,
  closeFormModal,
  handleConfirm,
  resetState
} = useUserForm({
  mode: modeRef,
  onClose: () => emits('update:visible', false),
  onSuccess: () => emits('refresh', true)
})

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetState()
    }
  }
)
</script>

<style scoped>
.user-form-wrapper {
  max-width: 800px;
}
</style>
