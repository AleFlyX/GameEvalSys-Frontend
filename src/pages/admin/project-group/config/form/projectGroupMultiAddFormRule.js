export const REVIEWER_GROUPS_MULTI_ADD_FORM_RULES = {
  prefixName: [
    { required: true, message: '请输入小组前缀名(如 院校名)', trigger: 'blur' },
    { min: 1, max: 50, message: '小组前缀名长度在1-50之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入小组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '小组名称长度在2-50之间', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度最多500字', trigger: 'blur' }
  ],
  isEnabled: [
    { required: true, message: '请选择小组状态', trigger: 'change' }
  ]
};
