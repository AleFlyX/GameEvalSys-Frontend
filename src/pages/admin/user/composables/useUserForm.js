import { computed, ref } from 'vue'

import { useMessage } from '@/composables/useMessage'

import { useUserActions } from './useUserActions'

const DEFAULT_PASSWORD = '123456'

/**
 * 新增/编辑/批量新增的表单提交逻辑。
 * @param {Object} params
 * @param {ref} params.mode 编辑模式
 * @param {}
 * @returns
 */
export function useUserForm({ mode, onClose, onSuccess }) {
  const message = useMessage()
  const { createUsers, updateUser } = useUserActions()

  const formRef = ref(null)
  const multiAddFormRef = ref(null)
  const multiAddMode = ref(false)
  const submitting = ref(false)

  const isEditMode = computed(() => mode.value === 'edit')

  const resetState = () => {
    multiAddMode.value = false
    submitting.value = false
  }

  const closeFormModal = () => {
    resetState()
    onClose?.()
  }

  const submitSingleUser = async () => {
    if (!formRef.value) {
      return
    }

    const { valid, data } = await formRef.value.validate()
    if (!valid) {
      message.error('请完善表单数据')
      return
    }

    const payload = { ...data }
    submitting.value = true

    try {
      //如果不是编辑用户，不能发送密码相关字段
      if (isEditMode.value) {
        if (!payload.newPassword) {
          delete payload.newPassword
        }
        delete payload.password
        delete payload.oldPassword

        const response = await updateUser(payload.id, payload)
        message.success(response.message || '保存成功')
      } else {
        if (!payload.password) {
          payload.password = DEFAULT_PASSWORD
          message.info('该用户使用默认密码注册')
        }
        delete payload.oldPassword
        delete payload.newPassword

        const response = await createUsers({ users: [payload] })
        message.success(response.message || '创建成功')
      }

      closeFormModal()
      await onSuccess?.()
    } catch (err) {
      message.error(`保存用户信息失败: ${err?.message || err}`)
    } finally {
      submitting.value = false
    }
  }

  const submitMultiUsers = async () => {
    if (!multiAddFormRef.value) {
      return
    }

    const { valid, data } = multiAddFormRef.value.validate()
    if (!valid) {
      message.error('请完善表单数据')
      return
    }

    submitting.value = true

    try {
      const response = await createUsers(data)
      message.success(response.message || '批量创建成功')
      closeFormModal()
      await onSuccess?.()
    } catch (err) {
      message.error(`批量创建用户失败: ${err?.message || err}`)
    } finally {
      submitting.value = false
    }
  }

  const handleConfirm = async () => {
    if (isEditMode.value) {
      await submitSingleUser()
      return
    }

    if (multiAddMode.value) {
      await submitMultiUsers()
      return
    }

    await submitSingleUser()
  }

  return {
    formRef,
    multiAddFormRef,
    multiAddMode,
    submitting,
    isEditMode,
    closeFormModal,
    handleConfirm,
    resetState
  }
}
