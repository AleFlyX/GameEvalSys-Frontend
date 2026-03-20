export const COLUMN_RULES = [
  {
    label: '小组ID',
    width: '150',
    colDataName: 'id',
  },
  {
    label: '组名',
    width: '200',
    colDataName: 'name',
  },
  {
    label: '状态',
    width: 'auto',
    colDataName: 'isEnabled',
    tagTypeMap: {
      1: 'success',
      0: 'danger'
    },
    tagNameMap: {
      1: '启用',
      0: '禁用'
    },
  },
]
