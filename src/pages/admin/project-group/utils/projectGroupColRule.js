export const COLUMN_RULES = [
  {
    label: '小组id',
    width: '200',
    colDataName: 'id',
  },
  {
    label: '组名',
    width: '200',
    colDataName: 'name',
  },
  {
    label: '状态',
    width: '150',
    colDataName: 'is_enabled',
    tagTypeMap: {
      true: 'success',
      false: 'info'
    },
    tagNameMap: {
      true: '启用',
      false: '禁用'
    },
  },
]
