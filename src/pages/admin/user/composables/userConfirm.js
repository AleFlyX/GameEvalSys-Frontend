import { showMsgBox } from '@/utils/ConfirmBox'
import userApi from '@/api/user'

// 封装禁用用户的确认逻辑
export const showDisableUserConfirm = async (user) => {
  // 1. 调用通用弹窗
  await showMsgBox(
    (user.isEnabled ? '启用' : '禁用') + '用户',
    `用户 ${user.name} `,
    { type: 'danger' }
  )

  // 2. 执行业务逻辑（请求接口）
  await userApi.editUser(user.id, {
    role: user.role,
    name: user.name,
    isEnabled: user.isEnabled
  })

  // 3. 返回成功结果（可选）
  return true
}

// 还可以封装其他用户相关的确认逻辑
// export const showDisableUserConfirm = async (user) => {
//   await showMsgBox({
//     title: '禁用用户',
//     content: `确认禁用用户 ${user.name} 吗？`
//   })
//   await userApi.disableUser(user.id)
// }
