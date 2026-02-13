export const columnsRules = [
  {
    label: '用户ID',
    width: '120',
    colDataName: 'id',
    icon: 'none',
  },
  {
    label: '用户名',
    width: '150',
    colDataName: 'username',
  },
  {
    label: '昵称',
    width: '150',
    colDataName: 'name',
  },
  {
    label: '创建时间',
    width: '200',
    colDataName: 'createTime',
    icon: 'timer'
  },
  {
    label: '角色',
    width: '150',
    colDataName: 'role',
    tagTypeMap: {
      super_admin: 'primary',
      admin: 'primary',
      scorer: 'success',
      normal: 'info'
    },
    tagNameMap: {
      super_admin: '超级管理员',
      admin: '管理员',
      scorer: '打分用户',
      normal: '普通用户'
    },
  },
  {
    label: '账户状态',
    width: '150',
    colDataName: 'isEnabled',
    tagTypeMap: {
      true: 'success',
      false: 'danger'
    },
    tagNameMap: {
      true: '可用',
      false: '禁用'
    },
  }

]
