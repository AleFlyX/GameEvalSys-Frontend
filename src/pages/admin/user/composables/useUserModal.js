import { computed, ref } from 'vue'

const createEmptyUser = () => ({
  id: '',
  username: '',
  password: '',
  oldPassword: '',
  newPassword: '',
  name: '',
  reviewerGroupIds: [],
  isEnabled: true,
  role: 'normal'
})
/**
 * 弹窗模式、显隐和当前处理用户。
 * @returns
 */
export function useUserModal() {
  const showUserFormModal = ref(false)
  const formMode = ref('create')
  const handlingData = ref(createEmptyUser())

  const isEditMode = computed(() => formMode.value === 'edit')
  const modalTitle = computed(() => (isEditMode.value ? '编辑用户' : '新增用户'))

  const openCreateModal = () => {
    formMode.value = 'create'
    handlingData.value = createEmptyUser()
    showUserFormModal.value = true
  }

  const openEditModal = (row) => {
    formMode.value = 'edit'
    handlingData.value = {
      ...createEmptyUser(),
      ...row
    }
    showUserFormModal.value = true
  }

  const closeUserFormModal = () => {
    showUserFormModal.value = false
  }

  return {
    showUserFormModal,
    formMode,
    handlingData,
    isEditMode,
    modalTitle,
    openCreateModal,
    openEditModal,
    closeUserFormModal
  }
}
