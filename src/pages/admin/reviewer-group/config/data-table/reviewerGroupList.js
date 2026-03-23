export const COLUMN_RULES = [
  {
    label: '评审组ID',
    width: '100',
    colDataName: 'id',
  },
  {
    label: '评审组名称',
    width: '180',
    colDataName: 'name',
  },
  {
    label: '组成员数',
    width: '100',
    colDataName: 'memberIds.length',
  },
  {
    label: '创建时间',
    width: '180',
    colDataName: 'createTime',
  },
  {
    label: '状态',
    width: '100',
    colDataName: 'isEnabled',
    tagTypeMap: {
      true: 'success',
      false: 'danger'
    },
    tagNameMap: {
      true: '启用',
      false: '禁用'
    },
  }
];
