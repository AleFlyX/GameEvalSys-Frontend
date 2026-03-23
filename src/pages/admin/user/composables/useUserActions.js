import { userApi } from '@/api/user'

import { showDisableUserConfirm } from './userConfirm'

/**
 * 用户状态切换、创建、编辑这类业务动作封装
 * @returns {Object}
 */
export function useUserActions() {
  const createUsers = (requestObj) => {
    return userApi.createUser(requestObj)
  }

  const updateUser = (userId, data) => {
    return userApi.editUser(userId, data)
  }

  const changeUserStatus = (status, row) => {
    return showDisableUserConfirm({ ...row, isEnabled: status })
  }

  return {
    createUsers,
    updateUser,
    changeUserStatus
  }
}
