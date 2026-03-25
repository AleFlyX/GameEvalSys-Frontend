//数据表格列定义
export const columnsRules = [
  {
    label: '项目名称',
    colDataName: 'name',
  },
  {
    label: '项目状态',
    width: '120',
    colDataName: 'status',
    tagTypeMap: {
      not_started: 'info',
      ongoing: 'success',
      ended: 'danger'
    },
    tagNameMap: {
      not_started: '未开始',
      ongoing: '进行中',
      ended: '已截止'
    },
  },
  {
    label: '开始日期',
    colDataName: 'startDate',
  },
  {
    label: '结束日期',
    colDataName: 'endDate',
  },
  {
    label: '完成度',
    colDataName: 'completionRate',
  }
];
