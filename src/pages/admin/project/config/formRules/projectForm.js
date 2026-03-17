/**
 * 项目表单验证规则
 */
export const projectFormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 100, message: '项目名称长度为 1 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '项目描述长度不能超过 500 个字符', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择项目开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择项目结束日期', trigger: 'change' }
  ],
  standardId: [
    { required: true, message: '请选择打分标准', trigger: 'change' }
  ],
  groupIds: [
    { required: true, message: '请选择至少一个小组', trigger: 'change' }
  ],
  scorerIds: [
    { required: true, message: '请选择至少一个打分用户', trigger: 'change' }
  ]
}
