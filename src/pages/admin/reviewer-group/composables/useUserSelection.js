import { ref, reactive } from 'vue'
import { userApi } from '@/api/user'

/**
 * 用户选择表格的通用逻辑
 * 支持在其他组件中复用用户选择功能
 *
 * @param {Object} options - 配置选项
 * @param {Array<string>} options.allowedRoles - 允许选择的角色列表
 * @param {Boolean} options.showDisabled - 是否显示已禁用的用户
 * @returns {Object} 用户选择的相关状态和方法
 *
 * @example
 * const { selectedIds, userList, fetchUsers } = useUserSelection({
 *   allowedRoles: ['scorer', 'admin'],
 *   showDisabled: false
 * })
 */
export function useUserSelection(options = {}) {
  const {
    allowedRoles = ['scorer', 'admin', 'super_admin'],
    showDisabled = false
  } = options

  const selectedIds = ref([])
  const userList = ref([])
  const loading = ref(false)

  const filterParams = reactive({
    role: '',
    showDisabled
  })

  /**
   * 获取用户列表
   */
  const fetchUsers = async (pageParams = { page: 1, size: 10 }) => {
    loading.value = true
    try {
      const queryParams = {
        ...pageParams,
        role: filterParams.role || undefined,
        isEnabled: !filterParams.showDisabled
      }

      const response = await userApi.getUserList(queryParams)
      if (response.code === 200 && response.data?.list) {
        // 过滤允许的角色
        userList.value = response.data.list.filter(user =>
          allowedRoles.includes(user.role)
        )
        return response.data
      }
      return null
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置已选择的用户ID列表
   */
  const setSelectedIds = (ids) => {
    selectedIds.value = Array.isArray(ids) ? ids : []
  }

  /**
   * 获取已选择的用户信息
   */
  const getSelectedUsers = () => {
    return userList.value.filter(user => selectedIds.value.includes(user.id))
  }

  /**
   * 添加单个用户
   */
  const addUser = (userId) => {
    if (!selectedIds.value.includes(userId)) {
      selectedIds.value.push(userId)
    }
  }

  /**
   * 移除单个用户
   */
  const removeUser = (userId) => {
    selectedIds.value = selectedIds.value.filter(id => id !== userId)
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedIds.value = []
  }

  return {
    selectedIds,
    userList,
    loading,
    filterParams,
    fetchUsers,
    setSelectedIds,
    getSelectedUsers,
    addUser,
    removeUser,
    clearSelection
  }
}
