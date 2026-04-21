import { userApi } from '@/api/user'

import { showDisableUserConfirm } from './userConfirm'

import { useLoading } from '@/composables/useLoading'
/**
 * 用户状态切换、创建、编辑这类业务动作api封装
 * @returns {Object}
 */
export function useUserActions() {
  const shouldFallbackToSingleRequests = (error) => {
    const status = error?.response?.status
    return status === 404 || status === 405 || status === 501
  }

  const normalizeBatchResult = (data = {}, extra = {}) => {
    const totalCount = data.totalCount ?? extra.totalCount ?? 0
    const successCount = data.successCount ?? 0
    const failCount = data.failCount ?? Math.max(totalCount - successCount, 0)
    const failedIds = Array.isArray(data.failedIds) ? data.failedIds : []

    return {
      totalCount,
      successCount,
      failCount,
      failedIds,
      ...extra
    }
  }

  const createUsers = (requestObj) => {
    return userApi.createUser(requestObj)
  }

  const updateUser = (userId, data) => {
    return userApi.editUser(userId, data)
  }

  const changeUserStatus = (status, row) => {
    return showDisableUserConfirm({ ...row, isEnabled: status })
  }

  // 修改用户可用状态
  const changeUserStatusDirect = (status, row) => {
    return userApi.editUser(row.id, {
      role: row.role,
      name: row.name,
      isEnabled: status
    })
  }

  const { isLoading: batchLoading, requestWithLoading: userBatchRequest } = useLoading('userList:batchLoading')
  // 批量修改用户状态
  const batchChangeUserStatus = async (status, rows = []) => {
    const targetRows = rows.filter((row) => row.isEnabled !== status)
    const targetIds = targetRows.map((row) => row.id)

    if (!targetIds.length) {
      return {
        totalCount: rows.length,
        targetCount: 0,
        skippedCount: rows.length,
        successCount: 0,
        failCount: 0,
        failedIds: []
      }
    }

    try { // 优先调用批量状态更新接口，若失败再尝试逐个单一更新
      const response = await userBatchRequest(userApi.batchUpdateUserStatus, {
        userIds: targetIds,
        isEnabled: status
      })

      return normalizeBatchResult(response.data, {
        totalCount: rows.length,
        targetCount: targetIds.length,
        skippedCount: rows.length - targetIds.length
      })
    } catch (error) {
      if (!shouldFallbackToSingleRequests(error)) {
        throw error
      }
    }

    const results = await Promise.allSettled(
      targetRows.map((row) => changeUserStatusDirect(status, row))
    )
    const successRows = targetRows.filter((_, index) => results[index].status === 'fulfilled')
    const failedRows = targetRows.filter((_, index) => results[index].status !== 'fulfilled')

    return {
      totalCount: rows.length,
      targetCount: targetRows.length,
      skippedCount: rows.length - targetRows.length,
      successCount: successRows.length,
      failCount: failedRows.length,
      failedIds: failedRows.map((row) => row.id)
    }
  }

  const deleteUser = (userId) => {
    return userApi.deleteUser(userId)
  }

  const batchDeleteUsers = async (rows = []) => {
    const userIds = rows.map((row) => row.id)

    if (!userIds.length) {
      return {
        totalCount: 0,
        successCount: 0,
        failCount: 0,
        failedIds: []
      }
    }

    try {
      const response = await userBatchRequest(userApi.batchDeleteUsers, { userIds })
      return normalizeBatchResult(response.data, {
        totalCount: rows.length
      })
    } catch (error) {
      if (!shouldFallbackToSingleRequests(error)) {
        throw error
      }
    }

    const results = await Promise.allSettled(
      rows.map((row) => deleteUser(row.id))
    )
    const successRows = rows.filter((_, index) => results[index].status === 'fulfilled')
    const failedRows = rows.filter((_, index) => results[index].status !== 'fulfilled')

    return {
      totalCount: rows.length,
      successCount: successRows.length,
      failCount: failedRows.length,
      failedIds: failedRows.map((row) => row.id)
    }
  }

  return {
    createUsers,
    updateUser,
    changeUserStatus,

    batchLoading, //批量操作加载状态
    batchChangeUserStatus,
    deleteUser,
    batchDeleteUsers
  }
}
