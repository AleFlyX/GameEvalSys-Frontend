export const columnsRules = [
  {
    label: '项目ID',
    width: '120',
    colDataName: 'id',
  },
  {
    label: '项目名',
    width: '150',
    colDataName: 'name',
  },
  {
    label: '开始时间',
    width: '200',
    colDataName: 'startDate',
    icon: 'timer'
  },
  {
    label: '结束时间',
    width: '200',
    colDataName: 'endDate',
    icon: 'WarningFilled'
  },
  {
    label: '项目状态',
    width: '150',
    colDataName: 'status',
    tagTypeMap: {
      not_started: 'info',
      started: 'success',
      ended: 'warning'
    },
    tagNameMap: {
      not_started: '尚未开始',
      started: '进行中',
      ended: '已结束'
    },
  },
  {
    label: '启用',
    width: '150',
    colDataName: 'isEnabled',
    tagTypeMap: {
      true: 'success',
      false: 'danger'
    },
    tagNameMap: {
      true: '已启用',
      false: '禁用'
    },
  }

]
